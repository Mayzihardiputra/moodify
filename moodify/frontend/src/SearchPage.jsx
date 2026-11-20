
import { useEffect, useState } from "react";
import {
  Search,
  TrendingUp,
  Sparkles,
  Play,
  X,
  Music2,
  ExternalLink,
} from "lucide-react";

import { searchMusic } from "./services/musicService";

export default function SearchPage({ onSelectSong }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [exploreSongs, setExploreSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exploreLoading, setExploreLoading] = useState(true);
  const [error, setError] = useState("");

  const trending = [
    "Joji",
    "The Weeknd",
    "Lana Del Rey",
    "Lo-fi",
    "Chill vibes",
  ];

  const moods = [
    { name: "Dreamy", emoji: "☁️", color: "from-fuchsia-500 to-purple-800" },
    { name: "Calm", emoji: "🌿", color: "from-emerald-400 to-teal-800" },
    { name: "Energized", emoji: "⚡", color: "from-orange-400 to-rose-600" },
    { name: "Melancholy", emoji: "🌧️", color: "from-blue-500 to-indigo-900" },
    { name: "Soulful", emoji: "✨", color: "from-amber-400 to-orange-800" },
  ];

  // Format Spotify track data for the existing Moodify components
  const formatSong = (track) => ({
    ...track,
    mood: "Spotify",
    time: `${Math.floor(track.duration / 60000)}:${String(
      Math.floor((track.duration % 60000) / 1000)
    ).padStart(2, "0")}`,
    color: "from-purple-500 to-indigo-900",
    emoji: "🎵",
  });

  // Search Spotify when the query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError("");
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const data = await searchMusic(query.trim());
        setResults(data.map(formatSong));
      } catch (err) {
        setResults([]);
        setError("Unable to search Spotify. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Load initial Explore music from Spotify
  useEffect(() => {
    const loadExploreMusic = async () => {
      try {
        const data = await searchMusic("indie pop");
        setExploreSongs(data.map(formatSong));
      } catch (err) {
        console.error("Explore music error:", err);
      } finally {
        setExploreLoading(false);
      }
    };

    loadExploreMusic();
  }, []);

  // Open selected song on Spotify
  const handleSelectSong = (song) => {
    onSelectSong?.(song);

    if (song.spotifyUrl) {
      window.open(song.spotifyUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">

      {/* Heading */}
      <section className="mb-9">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
          Discover something new
        </p>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Find your next{" "}
          <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            favorite.
          </span>
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Search for songs, artists, or music that matches your mood.
        </p>
      </section>

      {/* Search Input */}
      <section className="mb-10">
        <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 transition focus-within:border-purple-400/60 focus-within:bg-purple-500/[0.05]">
          <Search
            size={22}
            className="shrink-0 text-gray-500 transition group-focus-within:text-purple-400"
          />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-gray-500 transition hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </section>

      {/* Search Results */}
      {query ? (
        <section className="mb-12">
          <div className="mb-5">
            <p className="text-xs text-purple-300">SPOTIFY SEARCH</p>
            <h2 className="mt-1 text-lg font-semibold">
              Results for "{query}"
            </h2>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-gray-400">
              Searching Spotify...
            </p>
          ) : error ? (
            <p className="py-10 text-center text-sm text-red-400">
              {error}
            </p>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((song) => (
                <div
                  key={song.id}
                  className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition hover:border-purple-400/30 hover:bg-purple-500/[0.07]"
                >
                  <img
                    src={song.albumImage || ""}
                    alt={song.album}
                    className="h-14 w-14 shrink-0 rounded-xl bg-white/10 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold group-hover:text-purple-300">
                      {song.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {song.artist} · {song.album}
                    </p>
                  </div>

                  <span className="hidden text-xs text-gray-500 sm:block">
                    {song.time}
                  </span>

                  <button
                    onClick={() => handleSelectSong(song)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-900 transition hover:scale-105"
                    title="Listen on Spotify"
                  >
                    <ExternalLink size={17} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-14 text-center">
                <Music2 size={35} className="mx-auto mb-4 text-gray-600" />

                <h3 className="text-base font-semibold">
                  No results found
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Try searching for another song or artist.
                </p>
              </div>
            )
          )}
        </section>
      ) : (
        <>
          {/* Trending Searches */}
          <section className="mb-12">
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp size={19} className="text-purple-400" />
              <h2 className="text-lg font-semibold">
                Trending searches
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {trending.map((item, index) => (
                <button
                  key={item}
                  onClick={() => setQuery(item)}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-gray-300 transition hover:border-purple-400/40 hover:bg-purple-500/10 hover:text-white"
                >
                  <span className="text-gray-600">
                    0{index + 1}
                  </span>
                  {item}
                </button>
              ))}
            </div>
          </section>

          {/* Browse by Mood */}
          <section className="mb-12">
            <div className="mb-5 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" />
              <h2 className="text-lg font-semibold">
                Browse by mood
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {moods.map((mood) => (
                <button
                  key={mood.name}
                  onClick={() => setQuery(mood.name)}
                  className={`relative flex h-28 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${mood.color} p-4 text-left transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-900/20`}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-sm font-semibold">{mood.name}</span>
                  <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full border border-white/20" />
                </button>
              ))}
            </div>
          </section>

          {/* Explore Music */}
          <section className="mb-12">
            <div className="mb-5">
              <p className="mb-1 text-xs font-semibold text-purple-300">
                HANDPICKED FOR YOU
              </p>
              <h2 className="text-lg font-semibold">
                Explore music
              </h2>
            </div>

            {exploreLoading ? (
              <p className="py-8 text-sm text-gray-400">
                Loading music from Spotify...
              </p>
            ) : exploreSongs.length > 0 ? (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                {exploreSongs.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => handleSelectSong(song)}
                    className="group min-w-0 text-left"
                  >
                    <div className="relative mb-3 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1 transition duration-300 group-hover:-translate-y-1 group-hover:border-purple-400/40">
                      <img
                        src={song.albumImage || ""}
                        alt={song.album}
                        className="aspect-square w-full rounded-xl object-cover"
                      />

                      <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 opacity-0 shadow-lg transition group-hover:opacity-100">
                        <Play size={17} fill="currentColor" />
                      </div>
                    </div>

                    <p className="truncate text-sm font-semibold group-hover:text-purple-300">
                      {song.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-gray-500">
                      {song.artist}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-8 text-sm text-gray-500">
                Music is currently unavailable. Please try again later.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
