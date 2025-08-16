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
      "http://146.190.80.179:5173",
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

// Optimize Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  connectTimeout: 5000, // Reduced from 10000 to 5000 for faster connection attempts
  pingTimeout: 20000, // Reduced from 30000 to 20000 for faster detection of disconnections
  pingInterval: 10000, // Reduced from 25000 to 10000 for more frequent connection checks
  transports: ["websocket", "polling"], // Prefer WebSocket, fallback to polling
  allowEIO3: true, // Allow Engine.IO v3 clients
  maxHttpBufferSize: 1e6, // Limit message size to 1MB
  path: "/socket.io/", // Explicit path
  serveClient: false, // Don't serve the client
  cookie: false, // Disable cookies
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
