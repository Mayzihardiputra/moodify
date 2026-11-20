import express from "express";
import { searchSpotifyTracks } from "../services/spotifyService.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }

    const tracks = await searchSpotifyTracks(q.trim());

    res.json({
      success: true,
      total: tracks.length,
      data: tracks,
    });
  } catch (error) {
    console.error(
      "Spotify Search Error:",
      error.response?.data || error.message,
    );

    res.status(error.response?.status || 500).json({
      success: false,
      message: "Failed to search Spotify tracks.",
    });
  }
});

export default router;
