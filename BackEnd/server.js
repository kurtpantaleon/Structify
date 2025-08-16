const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { initializeSocket } = require("./socketHandlers");
const userRoutes = require("./routes/userRoutes");
const fs = require("fs");
const path = require("path");
const app = express();
const quizRoutes = require("./routes/quizRoute");
app.use("/api", quizRoutes);

// Check if Firebase Admin service account key exists and warn if not
const serviceAccountPath = path.join(
  __dirname,
  "structify-f712f-firebase-adminsdk-fbsvc-2f42c321c6.json"
);
if (!fs.existsSync(serviceAccountPath)) {
  console.warn(
    "\x1b[33m%s\x1b[0m",
    "⚠️  WARNING: Firebase Admin service account key not found!"
  );
  console.warn(
    "\x1b[33m%s\x1b[0m",
    "⚠️  Firebase Auth user deletion will not work."
  );
  console.warn(
    "\x1b[33m%s\x1b[0m",
    "⚠️  See README.md for setup instructions."
  );
}

// Optimize CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://structify.tech",
      "https://structify.studio",
      "https://structify-f712f.firebaseapp.com",
      "https://structify-f712f.web.app",
    ], // Allow both localhost and IP
    methods: ["GET", "POST"],
    credentials: true,
    maxAge: 86400, // Cache preflight requests for 24 hours
  })
);

// Optimize JSON parsing
app.use(express.json({ limit: "1mb" })); // Limit JSON payload size

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://structify.tech",
      "https://structify.studio",
      "https://structify-f712f.firebaseapp.com",
      "https://structify-f712f.web.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  connectTimeout: 5000,
  pingTimeout: 20000,
  pingInterval: 10000,
  transports: ["websocket", "polling"],
  allowEIO3: true,
  maxHttpBufferSize: 1e6,
  path: "/socket.io/",
  serveClient: false,
  cookie: false,
});

// Initialize socket handlers
initializeSocket(io);

// Mount the API routes
app.use("/", userRoutes);

// Basic health check route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Add a more detailed health check endpoint
app.get("/health", (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  };
  res.send(health);
});

// Import db.json for quiz questions
const db = require("./db.json");

// Dynamic endpoint for quiz questions by week
app.get("/api/quiz/week:weekNumber", (req, res) => {
  const week = parseInt(req.params.weekNumber, 10);
  if (isNaN(week)) {
    return res.status(400).json({ error: "Invalid week number" });
  }
  const weekQuestions = db.questions.filter((q) => q.week === week);
  res.json(weekQuestions);
});

// For merged weeks, just use the first week number
app.get("/api/quiz/week4-5", (req, res) => {
  const weekQuestions = db.questions.filter((q) => q.week === 4);
  res.json(weekQuestions);
});

app.get("/api/quiz/week7-8", (req, res) => {
  const weekQuestions = db.questions.filter((q) => q.week === 7);
  res.json(weekQuestions);
});

app.get("/api/quiz/week10-11", (req, res) => {
  const weekQuestions = db.questions.filter((q) => q.week === 10);
  res.json(weekQuestions);
});

const PORT = process.env.PORT || 3001;

// Handle server errors
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Please terminate the other process or use a different port.`
    );
    process.exit(1);
  } else {
    console.error("Server error:", error);
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});
