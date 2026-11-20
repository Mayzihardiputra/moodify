import axios from "axios";

let accessToken = null;
let tokenExpiresAt = 0;

// Mendapatkan Spotify Access Token
export const getSpotifyToken = async () => {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials are missing.");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "client_credentials",
    }),
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  accessToken = response.data.access_token;

  tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;

  return accessToken;
};

// Mencari lagu melalui Spotify
export const searchSpotifyTracks = async (query) => {
  const token = await getSpotifyToken();

  const response = await axios.get("https://api.spotify.com/v1/search", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      q: query,
      type: "track",
      limit: 10,
    },
  });

  return response.data.tracks.items.map((track) => ({
    spotifyId: track.id,
    name: track.name,
    artist: track.artists.map((artist) => artist.name).join(", "),
    album: track.album.name,
    albumImage: track.album.images[0]?.url || null,
    duration: track.duration_ms,
    spotifyUrl: track.external_urls.spotify,
  }));
};
