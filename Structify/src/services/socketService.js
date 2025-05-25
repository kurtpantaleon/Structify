import { io } from 'socket.io-client';

// Create a single socket instance that can be shared across components
let socket = null;
let heartbeatInterval = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const HEARTBEAT_INTERVAL = 10000; // 10 seconds
const RECONNECT_DELAY = 1000; // 1 second

// Socket options optimized for better performance
const socketOptions = {
  reconnection: true,
  reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
  reconnectionDelay: RECONNECT_DELAY,
  timeout: 5000, // Reduced from 10000 to match server
  transports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling
  forceNew: false, // Reuse existing connection if possible
  autoConnect: true, // Connect automatically
  path: '/socket.io/', // Match server path
  withCredentials: true, // Enable credentials
};

/**
 * Start the heartbeat mechanism to keep the connection alive
 * @param {SocketIO.Socket} socket - The socket instance
 */
function startHeartbeat(socket) {
  // Clear any existing heartbeat interval
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  // Send heartbeat every 10 seconds
  heartbeatInterval = setInterval(() => {
    if (socket && socket.connected) {
      socket.emit('heartbeat');
    }
  }, HEARTBEAT_INTERVAL);
}

/**
 * Stop the heartbeat mechanism
 */
function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

/**
 * Get a socket connection to the server
 * Creates a new socket if one doesn't exist or if force=true
 * @param {boolean} force - Force create a new socket even if one exists
 * @returns {SocketIO.Socket} - Socket.io socket instance
 */
export function getSocket(force = false) {
  if (!socket || force) {
    // Close existing socket if there is one and we're forcing a new connection
    if (socket && force) {
      console.log('Forcing new socket connection, cleaning up old one');
      stopHeartbeat();
      socket.disconnect();
      socket = null;
    }
    
    console.log('Creating new socket connection');
    socket = io('http://localhost:3001', socketOptions);
    
    // Set up default listeners
    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
      reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      startHeartbeat(socket);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      stopHeartbeat();
      
      // If the disconnect was not initiated by the client
      if (reason !== 'io client disconnect') {
        reconnectAttempts++;
        if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
          console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        }
      }
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      stopHeartbeat();
    });
    
    socket.io.on('reconnect', (attempt) => {
      console.log(`Socket reconnected after ${attempt} attempts`);
      reconnectAttempts = 0;
      startHeartbeat(socket);
    });
    
    socket.io.on('reconnect_attempt', (attempt) => {
      console.log(`Socket reconnection attempt ${attempt}`);
    });
    
    socket.io.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });
    
    socket.io.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after all attempts');
      stopHeartbeat();
    });

    // Handle reconnection events from server
    socket.on('reconnected', (data) => {
      console.log('Reconnected to match:', data);
      startHeartbeat(socket);
    });
  }
  
  return socket;
}

/**
 * Disconnect and clean up the socket connection
 */
export function disconnectSocket() {
  if (socket) {
    console.log('Manually disconnecting socket');
    stopHeartbeat();
    socket.disconnect();
    socket = null;
  }
}

/**
 * Check if the socket is currently connected
 * @returns {boolean} - True if connected, false otherwise
 */
export function isSocketConnected() {
  return socket && socket.connected;
}

/**
 * Force reconnect the socket if it's disconnected
 * @returns {SocketIO.Socket} - Socket.io socket instance
 */
export function reconnectSocket() {
  try {
    if (socket && !socket.connected) {
      console.log('Reconnecting socket');
      reconnectAttempts = 0; // Reset reconnect attempts
      socket.connect();
    } else if (!socket) {
      return getSocket(true);
    }
    return socket;
  } catch (error) {
    console.error('Error reconnecting socket:', error);
    // Clean up and create a fresh connection
    if (socket) {
      stopHeartbeat();
      socket.disconnect();
    }
    socket = null;
    return getSocket(true);
  }
}

// Clean up on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    disconnectSocket();
  });
}
