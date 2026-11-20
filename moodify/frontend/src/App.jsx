
import { useState, useEffect } from "react";
import { searchMusic } from "./services/musicService";

import {
  AudioWaveform,
  House,
  Library,
  Search,
  Sparkles,
  Heart,
  Play,
  MoreHorizontal,
  Clock3,
  ChevronRight,
  Headphones,
  ExternalLink,
  Bot,
} from "lucide-react";

import SearchPage from "./SearchPage";
import AIAssistant from "./AIAssistant";

// ==========================================
// MOOD DATA
// ==========================================

const moods = [
  {
    name: "Dreamy",
    color: "from-fuchsia-500 to-purple-700",
    emoji: "☁️",
  },
  {
    name: "Calm",
    color: "from-emerald-400 to-teal-700",
    emoji: "🌿",
  },
  {
    name: "Energized",
    color: "from-orange-400 to-rose-600",
    emoji: "⚡",
  },
  {
    name: "Melancholy",
    color: "from-blue-500 to-indigo-800",
    emoji: "🌧️",
  },
  {
    name: "Soulful",
    color: "from-amber-400 to-orange-700",
    emoji: "✨",
  },
];

// ==========================================
// MOOD SEARCH KEYWORDS
// ==========================================

const moodQueries = {
  Dreamy: "dreamy indie pop",
  Calm: "calm ambient chill",
  Energized: "upbeat energetic pop",
  Melancholy: "sad indie alternative",
  Soulful: "soul rnb",
};

// Detect a mood from everyday Indonesian or English phrases.
function detectMoodFromText(text) {
  const value = text.toLowerCase();

  const keywords = {
    Calm: [
      "calm", "relax", "relaxed", "peaceful", "quiet",
      "tired", "stress", "stressed", "capek", "lelah",
      "tenang", "santai", "istirahat", "pusing",
      "overthinking", "anxious",
    ],
    Energized: [
      "happy", "excited", "energetic", "hyped",
      "motivated", "semangat", "senang", "bahagia",
      "ceria", "workout", "olahraga", "party", "dance",
    ],
    Melancholy: [
      "sad", "lonely", "alone", "heartbroken", "miss",
      "missing", "cry", "crying", "down", "sedih",
      "kesepian", "galau", "kecewa", "patah hati",
      "kehilangan", "hujan",
    ],
    Soulful: [
      "love", "romantic", "romance", "relationship",
      "memories", "nostalgic", "rindu", "kangen",
      "sayang", "cinta", "kenangan", "soul",
    ],
    Dreamy: [
      "dreamy", "dream", "night", "midnight", "float",
      "wonder", "malam", "melamun", "khayal", "aesthetic",
    ],
  };

  for (const mood of [
    "Calm",
    "Energized",
    "Melancholy",
    "Soulful",
    "Dreamy",
  ]) {
    if (keywords[mood].some((word) => value.includes(word))) {
      return mood;
    }
  }

  return "Dreamy";
}

// ==========================================
// ARTWORK COMPONENT
// ==========================================

function Artwork({ color, emoji, image, size = "large" }) {
  return (
    <div
      className={`group relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${
        color || "from-purple-500 to-indigo-950"
      } ${size === "large" ? "aspect-square w-full" : "h-12 w-12"}`}
    >
      {image ? (
        <img
          src={image}
          alt="Album artwork"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <span className="text-3xl">{emoji || "🎵"}</span>
      )}

      <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/10" />
    </div>
  );
}

// ==========================================
// MAIN APP
// ==========================================

export default function App() {
  const [currentSong, setCurrentSong] = useState(null);

  const [selectedMood, setSelectedMood] = useState("Dreamy");
  const [activeNav, setActiveNav] = useState("Listen now");
  const [moodInput, setMoodInput] = useState("");
  const [customMood, setCustomMood] = useState("");
  const [searchOverride, setSearchOverride] = useState("");

  const [songs, setSongs] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [musicError, setMusicError] = useState("");

  // ========================================
  // FETCH MUSIC FROM SPOTIFY
  // ========================================

  useEffect(() => {
    const fetchMoodMusic = async () => {
      setLoadingSongs(true);
      setMusicError("");

      try {
        const query = searchOverride || moodQueries[selectedMood];
        const data = await searchMusic(query);

        const formattedSongs = data.map((track) => ({
          ...track,
          mood: selectedMood,

          time: `${Math.floor(track.duration / 60000)}:${String(
            Math.floor((track.duration % 60000) / 1000),
          ).padStart(2, "0")}`,

          color: "from-purple-500 to-indigo-950",
          emoji: "🎵",
        }));

        setSongs(formattedSongs);
      } catch (error) {
        console.error("Mood music error:", error);
        setMusicError("Unable to load music from Spotify.");
        setSongs([]);
      } finally {
        setLoadingSongs(false);
      }
    };

    fetchMoodMusic();
  }, [selectedMood, searchOverride]);

  // ========================================
  // FAVORITES STATE
  // ========================================

  const [favorites, setFavorites] = useState(() => {
    try {
      const savedFavorites = localStorage.getItem("moodify-favorites");
      return savedFavorites ? JSON.parse(savedFavorites) : [];
    } catch {
      return [];
    }
  });

  // Save favorites to localStorage

  useEffect(() => {
    localStorage.setItem("moodify-favorites", JSON.stringify(favorites));
  }, [favorites]);

  // ========================================
  // FAVORITES FUNCTIONS
  // ========================================

  const toggleFavorite = (song) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => item.id === song.id);

      if (exists) {
        return prev.filter((item) => item.id !== song.id);
      }

      return [...prev, song];
    });
  };

  const isFavorite = (song) => {
    return favorites.some((item) => item.id === song.id);
  };

  // ========================================
  // SELECT SONG
  // ========================================

  const playSong = (song) => {
    setCurrentSong(song);

    if (song.spotifyUrl) {
      window.open(song.spotifyUrl, "_blank", "noopener,noreferrer");
    }
  };

  // ========================================
  // CUSTOM MOOD SEARCH
  // ========================================

  const handleMoodSearch = (event) => {
    event.preventDefault();

    const text = moodInput.trim();

    if (!text) return;

    const detectedMood = detectMoodFromText(text);
    const query = `${moodQueries[detectedMood]} ${text}`;

    setSelectedMood(detectedMood);
    setCustomMood(text);
    setSearchOverride(query);
  };

  // ========================================
  // RECOMMENDED SONGS
  // ========================================

  const recommendedSongs = songs;

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-[#080611] text-white">
      {/* BACKGROUND EFFECT */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-purple-700/10 blur-[130px]" />

        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1600px]">
        {/* ================================== */}
        {/* SIDEBAR */}
        {/* ================================== */}

        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.07] px-7 py-8 lg:flex">
          {/* LOGO */}

          <div className="mb-14 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-indigo-600">
              <AudioWaveform size={23} />
            </div>

            <span className="text-2xl font-bold tracking-tight">
              moodify<span className="text-purple-400">.</span>
            </span>
          </div>

          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
            Discover
          </p>

          {/* NAVIGATION */}

          <nav className="space-y-2">
            {[
              { name: "Listen now", icon: House },
              { name: "Search", icon: Search },
              { name: "Your library", icon: Library },
              { name: "AI Assistant", icon: Bot },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  onClick={() => setActiveNav(item.name)}
                  className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm transition ${
                    activeNav === item.name
                      ? "bg-purple-500/15 font-semibold text-purple-300"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={19} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* SIDEBAR CARD */}

          <div className="mt-auto rounded-2xl border border-purple-400/15 bg-gradient-to-br from-purple-500/15 to-indigo-500/5 p-5">
            <Sparkles className="mb-3 text-purple-300" size={22} />

            <h3 className="mb-2 text-sm font-semibold">
              Music meets mood.
            </h3>

            <p className="text-xs leading-5 text-gray-400">
              Let your feelings guide your next listening experience.
            </p>
          </div>
        </aside>

        {/* ================================== */}
        {/* MAIN CONTENT */}
        {/* ================================== */}

        <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10">
          {/* HEADER */}

          <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:hidden">
              <AudioWaveform className="text-purple-400" size={27} />
              <span className="text-xl font-bold">moodify.</span>
            </div>

            {/* TOP NAVIGATION */}

            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1 sm:flex">
              {["Listen now", "Moods", "Library", "Radio"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    if (tab === "Library") {
                      setActiveNav("Your library");
                    } else {
                      setActiveNav(
                        tab === "Moods" || tab === "Radio" ? "Listen now" : tab,
                      );
                    }
                  }}
                  className={`rounded-full px-5 py-2 text-xs transition ${
                    activeNav === tab ||
                    (tab === "Library" && activeNav === "Your library")
                      ? "bg-white text-gray-900"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* USER ACTIONS */}

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-gray-300 hover:bg-white/10">
                <Sparkles size={14} className="text-purple-400" />
                Mood sync
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-600 text-xs font-bold">
                M
              </div>
            </div>
          </header>

          {/* ================================== */}
          {/* PAGE ROUTING */}
          {/* ================================== */}

          {activeNav === "AI Assistant" ? (
            /* AI ASSISTANT PAGE */

            <AIAssistant
              onSelectSong={playSong}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
            />
          ) : activeNav === "Search" ? (
            /* SEARCH PAGE */

            <SearchPage songs={songs} onSelectSong={playSong} />
          ) : activeNav === "Your library" ? (
            /* ================================== */
            /* YOUR LIBRARY PAGE */
            /* ================================== */

            <section className="animate-in fade-in duration-500">
              {/* LIBRARY HEADER */}

              <div className="mb-9">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
                  Your personal collection
                </p>

                <h1 className="text-3xl font-semibold sm:text-4xl">
                  Your <span className="text-purple-300">library.</span>
                </h1>

                <p className="mt-3 text-sm text-gray-500">
                  Your favorite sounds, all in one place.
                </p>
              </div>

              {/* FAVORITES HEADER */}

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Favorite songs</h2>

                  <p className="mt-1 text-xs text-gray-500">
                    {favorites.length} songs saved
                  </p>
                </div>

                <Heart size={21} className="text-pink-400" />
              </div>

              {/* FAVORITES LIST */}

              {favorites.length > 0 ? (
                <div className="space-y-3">
                  {favorites.map((song) => (
                    <div
                      key={song.id}
                      className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition hover:border-purple-400/30 hover:bg-white/[0.06]"
                    >
                      {/* SONG INFORMATION */}

                      <button
                        onClick={() => playSong(song)}
                        className="flex min-w-0 flex-1 items-center gap-4 text-left"
                      >
                        {song.albumImage ? (
                          <img
                            src={song.albumImage}
                            alt={song.album || song.title}
                            className="h-14 w-14 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
                              song.color || "from-purple-500 to-indigo-950"
                            } text-2xl`}
                          >
                            {song.emoji || "🎵"}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {song.title}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {song.artist} · {song.mood}
                          </p>
                        </div>
                      </button>

                      {/* REMOVE FAVORITE */}

                      <button
                        onClick={() => toggleFavorite(song)}
                        className="p-2 text-pink-400 transition hover:scale-110"
                        title="Remove from favorites"
                      >
                        <Heart size={19} fill="currentColor" />
                      </button>

                      {/* OPEN SPOTIFY */}

                      <button
                        onClick={() => playSong(song)}
                        className="p-2 text-gray-400 transition hover:text-white"
                        title="Listen on Spotify"
                      >
                        <Play size={18} fill="currentColor" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                /* EMPTY STATE */

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-16 text-center">
                  <Heart size={38} className="mx-auto mb-4 text-gray-600" />

                  <h3 className="font-semibold">No favorites yet</h3>

                  <p className="mx-auto mt-2 max-w-xs text-sm text-gray-500">
                    Discover music and tap the heart icon to save your favorite
                    songs here.
                  </p>

                  <button
                    onClick={() => setActiveNav("Listen now")}
                    className="mt-6 rounded-full bg-purple-500/20 px-5 py-2.5 text-xs font-semibold text-purple-300 transition hover:bg-purple-500/30"
                  >
                    Discover music
                  </button>
                </div>
              )}
            </section>
          ) : (
            /* ================================== */
            /* LISTEN NOW DASHBOARD */
            /* ================================== */

            <>
              {/* GREETING */}

              <section className="mb-10">
                <p className="mb-2 text-sm text-gray-400">
                  ✦ Your space, your sound
                </p>

                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Tonight feels{" "}
                  <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    {selectedMood.toLowerCase()}.
                  </span>
                </h1>

                <p className="mt-3 text-sm text-gray-500">
                  Find the soundtrack that feels like you.
                </p>
              </section>

              {/* CUSTOM MOOD SEARCH */}

              <section className="mb-10">
                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
                    YOUR MOOD, YOUR WORDS
                  </p>

                  <h2 className="text-xl font-semibold">
                    Tell us how you're feeling.
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Describe your mood and we'll find a soundtrack for it.
                  </p>
                </div>

                <form
                  onSubmit={handleMoodSearch}
                  className="rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-500/[0.09] to-indigo-500/[0.04] p-3 shadow-lg shadow-purple-950/10 sm:p-4"
                >
                  <textarea
                    value={moodInput}
                    onChange={(event) => setMoodInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleMoodSearch(event);
                      }
                    }}
                    rows={2}
                    maxLength={180}
                    placeholder="e.g. I'm feeling lonely and need comforting music..."
                    className="w-full resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-gray-600"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
                    <span className="text-[11px] text-gray-500">
                      Press Enter to search · {moodInput.length}/180
                    </span>

                    <button
                      type="submit"
                      disabled={!moodInput.trim() || loadingSongs}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Sparkles size={15} />
                      Find my mood
                    </button>
                  </div>
                </form>

                {customMood && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-gray-500">
                      Searching music for:
                    </span>

                    <span className="rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-1.5 text-purple-200">
                      "{customMood}"
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setCustomMood("");
                        setSearchOverride("");
                        setMoodInput("");
                      }}
                      className="text-gray-500 transition hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </section>

              {/* MOOD SELECTOR */}

              <section className="mb-11">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Pick a mood</h2>

                  <span className="text-xs text-gray-500">
                    Explore your feelings
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                  {moods.map((mood) => (
                    <button
                      key={mood.name}
                      onClick={() => {
                        setSelectedMood(mood.name);
                        setSearchOverride("");
                        setCustomMood("");
                      }}
                      className={`relative overflow-hidden rounded-2xl border p-4 text-left transition duration-300 hover:-translate-y-1 ${
                        selectedMood === mood.name
                          ? "border-white/60 ring-2 ring-purple-400/30"
                          : "border-white/10 hover:border-white/30"
                      } bg-gradient-to-br ${mood.color}`}
                    >
                      <span className="text-2xl">{mood.emoji}</span>

                      <p className="mt-4 text-sm font-semibold">
                        {mood.name}
                      </p>

                      {selectedMood === mood.name && (
                        <span className="absolute right-3 top-3 rounded-full bg-white px-2 py-1 text-[9px] font-bold text-gray-900">
                          SELECTED
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* RECOMMENDATIONS */}

              <section className="mb-10">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-xs font-semibold tracking-wider text-purple-300">
                      MADE FOR YOUR MOOD
                    </p>

                    <h2 className="text-lg font-semibold">
                      {customMood
                        ? `Music for "${customMood}"`
                        : `For a ${selectedMood.toLowerCase()} moment`}
                    </h2>
                  </div>

                  <button
                    onClick={() => setActiveNav("Search")}
                    className="flex items-center gap-1 text-xs text-gray-400 transition hover:text-white"
                  >
                    See all
                    <ChevronRight size={15} />
                  </button>
                </div>

                {/* LOADING / ERROR / SONG GRID */}

                {loadingSongs ? (
                  <p className="col-span-full py-12 text-center text-sm text-gray-400">
                    Discovering music for your mood...
                  </p>
                ) : musicError ? (
                  <p className="col-span-full py-12 text-center text-sm text-red-400">
                    {musicError}
                  </p>
                ) : recommendedSongs.length > 0 ? (
                  <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                    {recommendedSongs.map((song) => (
                      <div key={song.id} className="group min-w-0">
                        <button
                          onClick={() => playSong(song)}
                          className="block w-full text-left"
                        >
                          <div className="relative mb-3 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1 transition duration-300 hover:-translate-y-2 hover:border-purple-400/40 hover:shadow-xl hover:shadow-purple-900/20">
                            <Artwork
                              color={song.color}
                              emoji={song.emoji}
                              image={song.albumImage}
                            />

                            <div className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-3 items-center justify-center rounded-full bg-white text-gray-900 opacity-0 shadow-xl transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                              <Play size={18} fill="currentColor" />
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => playSong(song)}
                            className="min-w-0 truncate text-left text-sm font-semibold text-white transition hover:text-purple-300"
                          >
                            {song.title}
                          </button>

                          <div className="flex shrink-0 items-center gap-2">
                            {song.mood === selectedMood && (
                              <Sparkles
                                size={13}
                                className="text-purple-400"
                              />
                            )}

                            <button
                              onClick={() => toggleFavorite(song)}
                              className={`transition hover:scale-110 ${
                                isFavorite(song)
                                  ? "text-pink-400"
                                  : "text-gray-600 hover:text-pink-400"
                              }`}
                              title={
                                isFavorite(song)
                                  ? "Remove from favorites"
                                  : "Add to favorites"
                              }
                            >
                              <Heart
                                size={15}
                                fill={
                                  isFavorite(song) ? "currentColor" : "none"
                                }
                              />
                            </button>
                          </div>
                        </div>

                        <p className="mt-1 truncate text-xs text-gray-500">
                          {song.artist}
                        </p>

                        <p className="mt-2 text-[10px] uppercase tracking-wider text-gray-600">
                          {song.mood}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="col-span-full py-12 text-center text-sm text-gray-400">
                    No music found for this mood.
                  </p>
                )}
              </section>

              {/* QUICK PICKS */}

              <section className="mb-28">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Jump back in</h2>

                  <Clock3 size={17} className="text-gray-500" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {loadingSongs ? (
                    <p className="col-span-full py-6 text-sm text-gray-500">
                      Loading your music...
                    </p>
                  ) : (
                    songs.slice(0, 2).map((song) => (
                      <button
                        key={song.id}
                        onClick={() => playSong(song)}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] p-3 text-left transition hover:bg-white/[0.08]"
                      >
                        <Artwork
                          color={song.color}
                          emoji={song.emoji}
                          image={song.albumImage}
                          size="small"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {song.title}
                          </p>

                          <p className="mt-1 truncate text-xs text-gray-500">
                            {song.artist}
                          </p>
                        </div>

                        <Play size={16} className="text-gray-400" />
                      </button>
                    ))
                  )}
                </div>
              </section>
            </>
          )}
        </main>

        {/* ================================== */}
        {/* NOW PLAYING PANEL */}
        {/* ================================== */}

        <aside className="hidden w-[310px] shrink-0 border-l border-white/[0.07] px-6 py-8 xl:flex xl:flex-col">
          <div className="mb-7 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Now playing</h2>

            <button className="text-gray-500 hover:text-white">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* CURRENT SONG */}

          {currentSong ? (
            <>
              <Artwork
                color={currentSong.color}
                emoji={currentSong.emoji}
                image={currentSong.albumImage}
              />

              <div className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold">
                      {currentSong.title}
                    </h3>

                    <p className="mt-1 text-xs text-gray-400">
                      {currentSong.artist}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleFavorite(currentSong)}
                    className={`shrink-0 transition hover:scale-110 ${
                      isFavorite(currentSong)
                        ? "text-pink-400"
                        : "text-gray-400 hover:text-pink-400"
                    }`}
                    title={
                      isFavorite(currentSong)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <Heart
                      size={20}
                      fill={isFavorite(currentSong) ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <a
                  href={currentSong.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-purple-500/15 px-4 py-3 text-sm font-medium text-purple-300 transition hover:bg-purple-500/25"
                >
                  <ExternalLink size={16} />
                  Listen on Spotify
                </a>
              </div>
            </>
          ) : (
            <div className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-center">
              <Headphones size={38} className="mb-3 text-purple-400" />

              <p className="text-sm font-medium">Nothing playing yet</p>

              <p className="mt-2 text-xs text-gray-500">
                Discover a song to get started.
              </p>
            </div>
          )}

          {/* MOOD ANALYSIS */}

          <div className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={15} className="text-purple-300" />

              <p className="text-xs font-semibold">Mood analysis</p>
            </div>

            <p className="mb-4 text-xs leading-5 text-gray-400">
              {customMood
                ? `Based on your description, we're exploring a ${selectedMood.toLowerCase()} atmosphere.`
                : `Your current selection is creating a ${selectedMood.toLowerCase()} atmosphere.`}
            </p>

            <div className="space-y-3">
              {["Energy", "Calmness", "Vibe"].map((label, i) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-[10px] text-gray-400">
                    <span>{label}</span>
                    <span>{[34, 72, 82][i]}%</span>
                  </div>

                  <div className="h-1 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                      style={{
                        width: `${[34, 72, 82][i]}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM PLAYER */}

          <div className="mt-auto flex items-center justify-between border-t border-white/[0.07] pt-5 text-gray-500">
            <div className="flex items-center gap-2 text-xs">
              <Headphones size={16} />
              Listening space
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
