import { io } from 'socket.io-client';

// Create a single socket instance that can be shared across components
let socket = null;

// Socket options
const socketOptions = {
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 10000,
};

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
      socket.disconnect();
      socket = null;
    }
    
    console.log('Creating new socket connection');
    socket = io('http://localhost:3001', socketOptions);
    
    // Set up default listeners
    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    socket.io.on('reconnect', (attempt) => {
      console.log(`Socket reconnected after ${attempt} attempts`);
    });
    
    socket.io.on('reconnect_attempt', (attempt) => {
      console.log(`Socket reconnection attempt ${attempt}`);
    });
    
    socket.io.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });
    
    socket.io.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after all attempts');
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
      socket.connect();
    } else if (!socket) {
      return getSocket(true);
    }
    return socket;
  } catch (error) {
    console.error('Error reconnecting socket:', error);
    // Clean up and create a fresh connection
    if (socket) socket.disconnect();
    socket = null;
    return getSocket(true);
  }
}
