
import express from "express";
import { analyzeMood } from "../services/aiService.js";
import { searchSpotifyTracks } from "../services/spotifyService.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  const startTime = Date.now();

  try {
    const { message, history = [] } = req.body || {};

    // Validate user message
    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter your mood or feelings.",
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message must not exceed 1000 characters.",
      });
    }

    // Validate conversation history
    if (!Array.isArray(history)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation history.",
      });
    }

    // Keep only the last 10 valid messages.
    const validHistory = history
      .filter(
        (item) =>
          item &&
          ["user", "assistant"].includes(item.role) &&
          typeof item.text === "string" &&
          item.text.trim().length > 0
      )
      .slice(-10)
      .map((item) => ({
        role: item.role,
        text: item.text.slice(0, 1000),
      }));

    console.log("\n========== MOODIFY AI REQUEST ==========");
    console.log("User message:", message.trim());
    console.log("Conversation history:", validHistory.length);
    console.log("AI request started...");

    // Step 1: Analyze mood using Gemini
    const geminiStart = Date.now();

    const analysis = await analyzeMood(
      message.trim(),
      validHistory
    );

    const geminiTime = Date.now() - geminiStart;

    console.log(`Gemini completed in: ${geminiTime}ms`);
    console.log("Detected mood:", analysis.mood);
    console.log("Spotify search query:", analysis.searchQuery);

    // Step 2: Search Spotify
    const spotifyStart = Date.now();

    const tracks = await searchSpotifyTracks(
      analysis.searchQuery
    );

    const spotifyTime = Date.now() - spotifyStart;

    console.log(`Spotify completed in: ${spotifyTime}ms`);
    console.log(`Tracks found: ${tracks.length}`);

    // Step 3: Calculate total processing time
    const totalTime = Date.now() - startTime;

    console.log(`Total processing time: ${totalTime}ms`);
    console.log("========== REQUEST COMPLETED ==========\n");

    // Step 4: Return response
    return res.status(200).json({
      success: true,
      data: {
        reply: analysis.reply,
        mood: analysis.mood,
        searchQuery: analysis.searchQuery,
        tracks,
        performance: {
          geminiTime,
          spotifyTime,
          totalTime,
        },
      },
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;

    const status = Number(
      error.status ||
      error.code ||
      error.response?.status ||
      500
    );

    console.error("\n========== MOODIFY AI ERROR ==========");
    console.error(
      "Error:",
      error.response?.data || error.message
    );
    console.error(`Failed after: ${totalTime}ms`);
    console.error("=======================================\n");

    if ([408, 429, 500, 502, 503, 504].includes(status)) {
      return res.status(status).json({
        success: false,
        message:
          "Moodify AI is temporarily busy. Please try again in a moment.",
        performance: {
          totalTime,
        },
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while processing your music recommendation.",
      performance: {
        totalTime,
      },
    });
  }
});

export default router;
