
const API_URL = "http://localhost:5000/api";

export const searchMusic = async (query) => {
  const response = await fetch(
    `${API_URL}/music/search?q=${encodeURIComponent(query)}`
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to search music");
  }

  return result.data.map((track) => ({
    id: track.spotifyId,
    title: track.name,
    artist: track.artist,
    album: track.album,
    albumImage: track.albumImage,
    duration: track.duration,
    spotifyUrl: track.spotifyUrl,
  }));
};
