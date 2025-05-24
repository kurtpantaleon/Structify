const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initializeSocket } = require('./socketHandlers');
const userRoutes = require('./routes/userRoutes');
const fs = require('fs');
const path = require('path');

// Check if Firebase Admin service account key exists and warn if not
const serviceAccountPath = path.join(__dirname, 'structify-f712f-firebase-adminsdk-fbsvc-2f42c321c6.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️  WARNING: Firebase Admin service account key not found!');
  console.warn('\x1b[33m%s\x1b[0m', '⚠️  Firebase Auth user deletion will not work.');
  console.warn('\x1b[33m%s\x1b[0m', '⚠️  See README.md for setup instructions.');
}

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON request bodies

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your Vite frontend URL
    methods: ["GET", "POST"],
    credentials: true
  },
  connectTimeout: 10000,
  pingTimeout: 30000, // Increase ping timeout (default 5000ms)
  pingInterval: 25000 // Check connection every 25s (default 10000ms)
});

// Initialize socket handlers
initializeSocket(io);

// Mount the API routes
app.use('/', userRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT = process.env.PORT || 3001;

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please terminate the other process or use a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});