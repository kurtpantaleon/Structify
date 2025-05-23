const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initializeSocket } = require('./socketHandlers');

const app = express();
app.use(cors());

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