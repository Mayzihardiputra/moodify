
import { useEffect, useState } from "react";
import {
  Bot,
  Sparkles,
  Send,
  Music2,
  ExternalLink,
  Heart,
  LoaderCircle,
  MessageCircle,
  Plus,
  Headphones,
  MessageSquare,
  Clock3,
  Pencil,
  Trash2,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";
const STORAGE_KEY = "moodify_chat_history";

// WELCOME MESSAGE
const welcomeMessage = {
  role: "assistant",
  type: "welcome",
  text: "Hey there! I'm your Moodify AI music assistant. Tell me how you're feeling, and I'll find music that matches your moment.",
};

// SUGGESTIONS
const suggestions = [
  "I'm feeling lonely tonight",
  "I need music to focus",
  "I feel happy and energized",
  "Recommend Indonesian indie songs",
];

// MOOD COLORS
const moodColors = {
  Dreamy: "text-purple-300 bg-purple-400/10 border-purple-400/20",
  Calm: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
  Energized: "text-orange-300 bg-orange-400/10 border-orange-400/20",
  Melancholy: "text-blue-300 bg-blue-400/10 border-blue-400/20",
  Soulful: "text-pink-300 bg-pink-400/10 border-pink-400/20",
};

// CREATE SESSION
const createSession = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: "New conversation",
  customTitle: false,
  messages: [welcomeMessage],
  updatedAt: Date.now(),
});

// LOAD HISTORY
const loadSessions = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (session) =>
              session &&
              session.id &&
              Array.isArray(session.messages)
          )
          .map((session) => ({
            ...session,
            title: session.title || "New conversation",
            customTitle: session.customTitle || false,
            updatedAt: session.updatedAt || Date.now(),
          }));
      }
    }
  } catch (error) {
    console.error("Failed to load chat history:", error);
  }

  return [createSession()];
};

// GENERATE CHAT TITLE
const getSessionTitle = (messages) => {
  const firstUserMessage = messages.find(
    (message) => message.role === "user"
  );

  if (!firstUserMessage) {
    return "New conversation";
  }

  return firstUserMessage.text.length > 35
    ? `${firstUserMessage.text.slice(0, 35)}...`
    : firstUserMessage.text;
};

// FORMAT DATE
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
};

export default function AIAssistant({
  onSelectSong,
  onToggleFavorite,
  isFavorite,
}) {
  // CHAT SESSIONS
  const [sessions, setSessions] = useState(loadSessions);

  const [activeSessionId, setActiveSessionId] = useState(
    () => sessions[0]?.id
  );

  // INPUT AND LOADING
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // RENAME STATE
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // DELETE CONFIRMATION STATE
  const [pendingDeleteSession, setPendingDeleteSession] = useState(null);

  // ACTIVE CONVERSATION
  const activeSession =
    sessions.find(
      (session) => session.id === activeSessionId
    ) || sessions[0];

  const messages = activeSession?.messages || [welcomeMessage];

  // SAVE HISTORY TO LOCAL STORAGE
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(sessions)
      );
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }, [sessions]);

  // UPDATE SESSION
  const updateSession = (sessionId, updater) => {
    setSessions((previous) =>
      previous.map((session) =>
        session.id === sessionId
          ? updater(session)
          : session
      )
    );
  };

  // CREATE NEW CHAT
  const startNewConversation = () => {
    if (loading) return;

    const newSession = createSession();

    setSessions((previous) => [
      newSession,
      ...previous,
    ]);

    setActiveSessionId(newSession.id);
    setInput("");
    setEditingSessionId(null);
  };

  // OPEN OLD CHAT
  const openConversation = (session) => {
    if (loading) return;

    setActiveSessionId(session.id);
    setInput("");
    setEditingSessionId(null);
  };

  // RENAME CHAT
  const startRename = (session) => {
    if (loading) return;

    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const saveRename = (sessionId) => {
    const newTitle = editTitle.trim();

    if (!newTitle) return;

    updateSession(sessionId, (session) => ({
      ...session,
      title: newTitle,
      customTitle: true,
    }));

    setEditingSessionId(null);
    setEditTitle("");
  };

  const cancelRename = () => {
    setEditingSessionId(null);
    setEditTitle("");
  };

  // OPEN DELETE CONFIRMATION
  const deleteConversation = (session) => {
    if (loading) return;

    setPendingDeleteSession(session);
  };

  // OPEN CLEAR ALL CONFIRMATION
  const clearAllConversations = () => {
    if (loading || sessions.length === 0) return;

    setPendingDeleteSession({
      id: "clear-all",
      title: "All conversations",
      isClearAll: true,
    });
  };

  // CONFIRM CLEAR ALL
  const confirmClearAllConversations = () => {
    if (loading) return;

    const newSession = createSession();

    setSessions([newSession]);
    setActiveSessionId(newSession.id);
    setInput("");
    setEditingSessionId(null);
    setPendingDeleteSession(null);
  };

  // CONFIRM DELETE
  const confirmDeleteConversation = () => {
    if (!pendingDeleteSession || loading) return;

    // CLEAR ALL CONVERSATIONS
    if (pendingDeleteSession.isClearAll) {
      confirmClearAllConversations();
      return;
    }

    // DELETE SINGLE CONVERSATION
    const sessionId = pendingDeleteSession.id;

    const remainingSessions = sessions.filter(
      (session) => session.id !== sessionId
    );

    if (sessionId === activeSessionId) {
      if (remainingSessions.length > 0) {
        setActiveSessionId(remainingSessions[0].id);
      } else {
        const newSession = createSession();

        remainingSessions.push(newSession);
        setActiveSessionId(newSession.id);
      }

      setInput("");
    }

    setSessions(remainingSessions);

    if (editingSessionId === sessionId) {
      cancelRename();
    }

    setPendingDeleteSession(null);
  };

  // CANCEL DELETE
  const cancelDeleteConversation = () => {
    setPendingDeleteSession(null);
  };

  // SEND MESSAGE
  const sendMessage = async (messageText = input) => {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || loading || !activeSession) {
      return;
    }

    const sessionId = activeSession.id;

    // CONVERSATION MEMORY
    const history = activeSession.messages
      .filter(
        (message) =>
          (message.role === "user" ||
            message.role === "assistant") &&
          message.type !== "welcome" &&
          message.type !== "error"
      )
      .slice(-10)
      .map((message) => ({
        role: message.role,
        text: message.text,
      }));

    const userMessage = {
      role: "user",
      text: trimmedMessage,
    };

    // SAVE USER MESSAGE
    updateSession(sessionId, (session) => {
      const updatedMessages = [
        ...session.messages,
        userMessage,
      ];

      return {
        ...session,
        messages: updatedMessages,
        title: session.customTitle
          ? session.title
          : getSessionTitle(updatedMessages),
        updatedAt: Date.now(),
      };
    });

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/ai/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmedMessage,
            history,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to get AI recommendations."
        );
      }

      const data = result.data;

      // MAP SPOTIFY TRACKS
      const tracks = (data.tracks || []).map((track) => ({
        id: track.spotifyId,
        spotifyId: track.spotifyId,
        title: track.name,
        name: track.name,
        artist: track.artist,
        album: track.album,
        albumImage: track.albumImage,
        image: track.albumImage,
        duration: track.duration,
        spotifyUrl: track.spotifyUrl,
        externalUrl: track.spotifyUrl,
      }));

      const assistantMessage = {
        role: "assistant",
        text: data.reply,
        mood: data.mood,
        searchQuery: data.searchQuery,
        tracks,
        performance: data.performance,
      };

      // SAVE AI RESPONSE TO THE CORRECT SESSION
      updateSession(sessionId, (session) => ({
        ...session,
        messages: [
          ...session.messages,
          assistantMessage,
        ],
        updatedAt: Date.now(),
      }));
    } catch (error) {
      console.error("Moodify AI Error:", error);

      updateSession(sessionId, (session) => ({
        ...session,
        messages: [
          ...session.messages,
          {
            role: "assistant",
            type: "error",
            text: "Sorry, something went wrong. Please try again in a moment.",
          },
        ],
        updatedAt: Date.now(),
      }));
    } finally {
      setLoading(false);
    }
  };

  // FORM SUBMIT
  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <div className="relative mx-auto flex h-[calc(100vh-120px)] min-h-[650px] w-full max-w-7xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[#11111b] shadow-2xl shadow-black/20">

      {/* SIDEBAR */}
      <aside className="hidden w-[250px] shrink-0 flex-col border-r border-white/[0.07] bg-[#151521] md:flex">

        {/* SIDEBAR HEADER */}
        <div className="border-b border-white/[0.07] p-5">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-indigo-600">
              <Music2 size={20} className="text-white" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-white">
                Moodify
              </h2>

              <p className="text-[10px] text-gray-500">
                Your personal music space
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={startNewConversation}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={16} />
            New Conversation
          </button>

        </div>

        {/* HISTORY TITLE */}
        <div className="flex items-center justify-between px-5 pb-3 pt-5">

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Recent conversations
            </span>

            <span className="ml-2 rounded-full bg-white/[0.06] px-2 py-1 text-[10px] text-gray-400">
              {sessions.length}
            </span>
          </div>

          <button
            type="button"
            onClick={clearAllConversations}
            disabled={loading || sessions.length === 0}
            className="text-[10px] font-medium text-gray-500 transition hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
            title="Clear all conversations"
          >
            Clear all
          </button>

        </div>

        {/* HISTORY LIST */}
        <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">

          {sessions.map((session) => {
            const active =
              session.id === activeSessionId;

            const editing =
              editingSessionId === session.id;

            return (
              <div
                key={session.id}
                className={`group rounded-xl border transition ${
                  active
                    ? "border-purple-400/20 bg-purple-500/10"
                    : "border-transparent hover:bg-white/[0.04]"
                }`}
              >

                <div className="flex items-center gap-2 p-2">

                  {editing ? (
                    <div className="flex min-w-0 flex-1 items-center gap-1">

                      <input
                        autoFocus
                        value={editTitle}
                        onChange={(event) =>
                          setEditTitle(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            saveRename(session.id);
                          }

                          if (event.key === "Escape") {
                            cancelRename();
                          }
                        }}
                        className="min-w-0 flex-1 rounded-lg border border-purple-400/30 bg-[#11111b] px-2 py-2 text-xs text-white outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => saveRename(session.id)}
                        disabled={!editTitle.trim()}
                        className="rounded-lg p-2 text-emerald-400 hover:bg-emerald-400/10 disabled:opacity-30"
                        title="Save name"
                      >
                        <Check size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={cancelRename}
                        className="rounded-lg p-2 text-gray-400 hover:bg-white/10"
                        title="Cancel"
                      >
                        <X size={15} />
                      </button>

                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => openConversation(session)}
                        disabled={loading}
                        className="flex min-w-0 flex-1 items-start gap-2.5 p-1 text-left disabled:opacity-50"
                      >

                        <MessageSquare
                          size={15}
                          className={`mt-0.5 shrink-0 ${
                            active
                              ? "text-purple-400"
                              : "text-gray-500"
                          }`}
                        />

                        <div className="min-w-0 flex-1">

                          <p
                            className={`truncate text-xs font-medium ${
                              active
                                ? "text-purple-200"
                                : "text-gray-300"
                            }`}
                          >
                            {session.title}
                          </p>

                          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-500">
                            <Clock3 size={10} />
                            {formatDate(session.updatedAt)}
                          </div>

                        </div>

                      </button>

                      {/* CHAT ACTIONS */}
                      <div className="flex shrink-0 items-center opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">

                        <button
                          type="button"
                          onClick={() => startRename(session)}
                          disabled={loading}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-purple-400/10 hover:text-purple-300 disabled:opacity-30"
                          title="Rename conversation"
                        >
                          <Pencil size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteConversation(session)}
                          disabled={loading}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-red-400/10 hover:text-red-400 disabled:opacity-30"
                          title="Delete conversation"
                        >
                          <Trash2 size={13} />
                        </button>

                      </div>
                    </>
                  )}

                </div>
              </div>
            );
          })}

        </div>

        {/* SIDEBAR FOOTER */}
        <div className="border-t border-white/[0.07] p-4">

          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <MessageCircle size={13} />
            Chat history saved locally
          </div>

        </div>

      </aside>

      {/* MAIN CHAT */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* CHAT HEADER */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-600 shadow-lg shadow-purple-500/20">
              <Bot size={23} className="text-white" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                Moodify AI
              </h2>

              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Ready to discover music
              </div>
            </div>

          </div>

          {/* MOBILE NEW CHAT */}
          <button
            type="button"
            onClick={startNewConversation}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-purple-400/20 bg-purple-400/10 px-3 py-2 text-xs font-medium text-purple-200 transition hover:border-purple-400/40 hover:bg-purple-400/20 disabled:opacity-40 md:hidden"
          >
            <Plus size={15} />
            New Chat
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-white/[0.07] px-3 py-2 text-[11px] text-gray-400 md:flex">
            <Music2 size={13} />
            AI Music Discovery
          </div>

        </div>

        {/* MESSAGES */}
        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-6">

          {messages.map((message, index) => (

            <div
              key={index}
              className={`flex gap-3 ${
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              {message.role === "assistant" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-indigo-600">
                  <Bot size={19} className="text-white" />
                </div>
              )}

              <div
                className={`max-w-[90%] sm:max-w-[80%] ${
                  message.role === "user"
                    ? "rounded-2xl rounded-tr-sm bg-purple-600 px-4 py-3 text-white"
                    : "space-y-4"
                }`}
              >

                {message.role === "user" ? (

                  <p className="text-sm leading-relaxed">
                    {message.text}
                  </p>

                ) : (

                  <div className="space-y-4">

                    {/* AI MESSAGE */}
                    <div
                      className={`rounded-2xl rounded-tl-sm border px-4 py-3 ${
                        message.type === "error"
                          ? "border-red-400/20 bg-red-400/10"
                          : "border-white/[0.07] bg-[#1b1b29]"
                      }`}
                    >

                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
                        {message.text}
                      </p>

                      {/* MOOD */}
                      {message.mood && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">

                          <span className="text-[11px] text-gray-500">
                            Detected mood:
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
                              moodColors[message.mood] ||
                              "border-white/10 bg-white/5 text-gray-300"
                            }`}
                          >
                            {message.mood}
                          </span>

                        </div>
                      )}

                    </div>

                    {/* SPOTIFY RECOMMENDATIONS */}
                    {message.tracks?.length > 0 && (

                      <div className="space-y-3">

                        <div className="flex items-center justify-between">

                          <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                            <Sparkles
                              size={14}
                              className="text-purple-400"
                            />
                            Recommended for you
                          </h3>

                          <span className="text-[10px] text-gray-500">
                            {message.tracks.length} tracks
                          </span>

                        </div>

                        <div className="space-y-2">

                          {message.tracks.map((track) => {

                            const favorite = isFavorite
                              ? isFavorite(track.id)
                              : false;

                            return (
                              <div
                                key={track.id}
                                className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#1b1b29] p-3 transition hover:border-purple-400/20 hover:bg-[#222235]"
                              >

                                <img
                                  src={track.albumImage}
                                  alt={track.album || track.title}
                                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                                />

                                <div className="min-w-0 flex-1">

                                  <p className="truncate text-sm font-medium text-white">
                                    {track.title}
                                  </p>

                                  <p className="mt-1 truncate text-xs text-gray-500">
                                    {track.artist}
                                  </p>

                                </div>

                                <div className="flex items-center gap-1">

                                  {/* FAVORITE */}
                                  {onToggleFavorite && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onToggleFavorite(track)
                                      }
                                      className={`rounded-lg p-2 transition ${
                                        favorite
                                          ? "text-pink-400"
                                          : "text-gray-500 hover:bg-white/5 hover:text-pink-400"
                                      }`}
                                      title="Add to favorites"
                                    >
                                      <Heart
                                        size={17}
                                        fill={
                                          favorite
                                            ? "currentColor"
                                            : "none"
                                        }
                                      />
                                    </button>
                                  )}

                                  {/* SPOTIFY */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onSelectSong) {
                                        onSelectSong(track);
                                      } else if (track.spotifyUrl) {
                                        window.open(
                                          track.spotifyUrl,
                                          "_blank",
                                          "noopener,noreferrer"
                                        );
                                      }
                                    }}
                                    className="rounded-lg bg-purple-500/10 p-2 text-purple-300 transition hover:bg-purple-500/20"
                                    title="Listen on Spotify"
                                  >
                                    <ExternalLink size={17} />
                                  </button>

                                </div>

                              </div>
                            );
                          })}

                        </div>

                        <p className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          <Music2 size={11} />
                          Listen to these tracks on Spotify
                        </p>

                      </div>
                    )}

                  </div>
                )}

              </div>

              {message.role === "user" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <MessageCircle
                    size={17}
                    className="text-gray-300"
                  />
                </div>
              )}

            </div>
          ))}

          {/* LOADING */}
          {loading && (

            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-indigo-600">
                <Bot size={19} className="text-white" />
              </div>

              <div className="flex items-center gap-3 rounded-2xl rounded-tl-sm border border-white/[0.07] bg-[#1b1b29] px-4 py-3">

                <LoaderCircle
                  size={16}
                  className="animate-spin text-purple-400"
                />

                <span className="text-xs text-gray-400">
                  Remembering our conversation...
                </span>

              </div>

            </div>
          )}

          {/* SUGGESTIONS */}
          {messages.length === 1 &&
            messages[0].type === "welcome" && (

              <div className="ml-12 space-y-3">

                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                  Try asking me
                </p>

                <div className="flex flex-wrap gap-2">

                  {suggestions.map((suggestion) => (

                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => sendMessage(suggestion)}
                      disabled={loading}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-gray-400 transition hover:border-purple-400/30 hover:bg-purple-400/10 hover:text-purple-200"
                    >
                      {suggestion}
                    </button>

                  ))}

                </div>

              </div>
            )}

        </div>

        {/* INPUT AREA */}
        <div className="border-t border-white/[0.07] bg-[#11111b] p-4 sm:px-6 sm:py-5">

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 rounded-2xl border border-white/[0.09] bg-[#1b1b29] p-2 transition focus-within:border-purple-400/40"
          >

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
              <Headphones
                size={19}
                className="text-purple-400"
              />
            </div>

            <input
              type="text"
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              placeholder="Tell me how you're feeling..."
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {loading ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Send size={18} />
              )}
            </button>

          </form>

          <p className="mt-3 text-center text-[10px] text-gray-600">
            Moodify AI helps you discover music that matches your mood.
          </p>

        </div>

      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {pendingDeleteSession && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={cancelDeleteConversation}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-200 rounded-3xl border border-white/10 bg-[#191825] p-6 shadow-2xl shadow-black/50"
          >

            {/* CLOSE BUTTON */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={cancelDeleteConversation}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-white/10 hover:text-white"
                aria-label="Close delete confirmation"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="flex flex-col items-center text-center">

              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10">
                <AlertTriangle
                  size={30}
                  className="text-red-400"
                />
              </div>

              <h2
                id="delete-dialog-title"
                className="text-xl font-bold text-white"
              >
                {pendingDeleteSession.isClearAll
                  ? "Clear all conversations?"
                  : "Delete conversation?"}
              </h2>

              <p
                id="delete-dialog-description"
                className="mt-2 max-w-[300px] text-sm leading-relaxed text-gray-400"
              >
                {pendingDeleteSession.isClearAll
                  ? "Are you sure you want to delete all your chat history? This action cannot be undone."
                  : "Are you sure you want to delete this conversation? This action cannot be undone."}
              </p>

            </div>

            {/* CONVERSATION PREVIEW */}
            <div className="mt-6 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">

              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {pendingDeleteSession.isClearAll
                  ? "Items to be deleted"
                  : "Conversation"}
              </p>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                  <MessageSquare
                    size={18}
                    className="text-red-400"
                  />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-medium text-gray-200">
                    {pendingDeleteSession.isClearAll
                      ? `All ${sessions.length} conversations`
                      : pendingDeleteSession.title}
                  </p>

                  {pendingDeleteSession.isClearAll && (
                    <p className="mt-1 text-[10px] text-gray-500">
                      Your entire chat history will be removed.
                    </p>
                  )}

                </div>

              </div>

            </div>

            {/* MODAL ACTIONS */}
            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={cancelDeleteConversation}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteConversation}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 active:scale-[0.98]"
              >
                <Trash2 size={16} />

                {pendingDeleteSession.isClearAll
                  ? "Clear All"
                  : "Delete Chat"}
              </button>

            </div>

            <p className="mt-4 text-center text-[10px] text-gray-600">
              Your conversation will be permanently removed.
            </p>

          </div>
        </div>
      )}

    </div>
  );
}
