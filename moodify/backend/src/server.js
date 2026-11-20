import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import musicRoutes from "./routes/musicRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  }),
);

app.use(express.json({ limit: "10kb" }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Moodify backend is running!",
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to Moodify API!");
});

app.use("/api/music", musicRoutes);

app.use("/api/ai", aiRoutes);

app.listen(PORT, () => {
  console.log(`Moodify backend running at http://localhost:${PORT}`);
});
