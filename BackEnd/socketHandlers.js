// Using Map for better key-value lookup instead of Set for the queue
const queue = new Map(); // socketId -> playerData
// Track active matches and participants
const activeMatches = new Map(); // matchId -> { player1: socketId, player2: socketId, difficulty: string }
// Track selected challenges for each match
const matchChallenges = new Map(); // matchId -> challengeId
// Track idle connections for cleanup
const socketActivityTimestamps = new Map(); // socketId -> last activity timestamp
// Track socket IDs by match ID for easier lookup
const matchSocketIds = new Map(); // matchId -> [socketId1, socketId2]
// Track socket status (connected, disconnected but waiting, completely gone)
const socketStatus = new Map(); // socketId -> { status: 'connected'|'waiting'|'gone', lastSeen: timestamp }

// Constants for timeouts and intervals
const RECONNECT_TIMEOUT = 10000; // 10 seconds to attempt reconnection
const FINAL_CLEANUP_TIMEOUT = 120000; // 2 minutes before final cleanup
const CLEANUP_INTERVAL = 60000; // Run cleanup every minute
const STALE_CONNECTION_TIMEOUT = 300000; // 5 minutes before considering a connection stale
const WAITING_TIMEOUT = 120000; // 2 minutes before cleaning up waiting sockets

/**
 * Helper function to clean up a disconnected socket
 * @param {string} socketId - The ID of the socket that disconnected
 * @param {boolean} [forceCleanup=false] - Force cleanup even if in waiting state
 */
function cleanupDisconnectedSocket(socketId, forceCleanup = false) {
  // Update socket status
  const status = socketStatus.get(socketId);
  
  // If socket is in waiting state and we're not forcing cleanup, just return
  if (status && status.status === 'waiting' && !forceCleanup) {
    console.log(`Socket ${socketId} is in waiting state, not cleaning up yet`);
    return;
  }
  
  // Otherwise update status to gone
  socketStatus.set(socketId, { status: 'gone', lastSeen: Date.now() });
  
  // Remove from queue
  if (queue.has(socketId)) {
    console.log(`Removing ${socketId} from queue due to disconnect`);
    queue.delete(socketId);
  }
  
  // Clean up any matches this socket was part of
  for (const [matchId, participants] of activeMatches.entries()) {
    if (participants.player1 === socketId || participants.player2 === socketId) {
      console.log(`Cleaning up match ${matchId} due to player ${socketId} disconnect`);
      
      // Get the other player in the match
      const otherPlayerId = participants.player1 === socketId ? participants.player2 : participants.player1;
      
      // Remove match from active matches and challenges
      activeMatches.delete(matchId);
      matchChallenges.delete(matchId);
      
      // Clean up match socket ids
      if (matchSocketIds.has(matchId)) {
        matchSocketIds.delete(matchId);
      }
    }
  }
  
  // Clear activity timestamp
  socketActivityTimestamps.delete(socketId);
}

function initializeSocket(io) {
  // Run periodic cleanup every minute to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    
    // Check for stale socket connections
    socketActivityTimestamps.forEach((timestamp, socketId) => {
      if (now - timestamp > STALE_CONNECTION_TIMEOUT) {
        console.log(`Cleaning up stale socket: ${socketId}`);
        cleanupDisconnectedSocket(socketId, true);
      }
    });
    
    // Check for waiting sockets that have been waiting too long
    socketStatus.forEach((status, socketId) => {
      if (status.status === 'waiting' && (now - status.lastSeen > WAITING_TIMEOUT)) {
        console.log(`Socket ${socketId} has been waiting too long, cleaning up`);
        cleanupDisconnectedSocket(socketId, true);
      }
    });
  }, CLEANUP_INTERVAL);
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Track connection time and status
    socketActivityTimestamps.set(socket.id, Date.now());
    socketStatus.set(socket.id, { status: 'connected', lastSeen: Date.now() });
    
    // Handle reconnection attempts
    socket.on('reconnect_attempt', () => {
      console.log(`Socket ${socket.id} attempting to reconnect`);
      socketStatus.set(socket.id, { status: 'waiting', lastSeen: Date.now() });
    });
    
    // Handle successful reconnection
    socket.on('reconnect', () => {
      console.log(`Socket ${socket.id} reconnected successfully`);
      socketStatus.set(socket.id, { status: 'connected', lastSeen: Date.now() });
      socketActivityTimestamps.set(socket.id, Date.now());
    });
    
    // Check if this socket was previously in a match
    let foundExistingMatch = false;
    for (const [matchId, participants] of activeMatches.entries()) {
      if (participants.pendingReconnect === socket.id) {
        console.log(`Reconnected socket ${socket.id} to match ${matchId}`);
        
        // Update the participant with the new socket ID
        if (participants.player1_old === participants.pendingReconnect) {
          participants.player1 = socket.id;
          delete participants.player1_old;
        } else if (participants.player2_old === participants.pendingReconnect) {
          participants.player2 = socket.id;
          delete participants.player2_old;
        }
        
        delete participants.pendingReconnect;
        foundExistingMatch = true;
        
        // Notify the reconnected player
        socket.emit('reconnected', { matchId });
      }
    }
    
    // Check for existing players in queue to optimize matchmaking
    if (queue.size > 0) {
      socket.emit('queueUpdate', { position: queue.size });
    }

    // Handle heartbeat to keep connection alive
    socket.on('heartbeat', () => {
      socketActivityTimestamps.set(socket.id, Date.now());
      socketStatus.set(socket.id, { status: 'connected', lastSeen: Date.now() });
    });

    socket.on('findMatch', (playerData) => {
      // Update activity timestamp
      socketActivityTimestamps.set(socket.id, Date.now());
      
      // Add player to queue
      const player = {
        id: socket.id,
        name: playerData.name,
        rank: playerData.rank || 0,
        avatar: playerData.avatar,
        userId: playerData.userId,
        difficulty: playerData.difficulty || 'Easy'
      };

      // If there's someone in queue, try to match
      if (queue.size > 0) {
        const [opponentId, opponent] = Array.from(queue.entries())[0];
        queue.delete(opponentId);

        const matchId = `match_${Date.now()}`;
        const matchDifficulty = 
          getDifficultyLevel(player.difficulty) >= getDifficultyLevel(opponent.difficulty) 
            ? player.difficulty 
            : opponent.difficulty;
            
        activeMatches.set(matchId, {
          player1: opponent.id,
          player2: socket.id,
          difficulty: matchDifficulty
        });
        
        // Notify both players
        io.to(opponent.id).emit('matchFound', {
          matchId,
          opponent: {
            name: player.name,
            rank: player.rank,
            avatar: player.avatar
          },
          difficulty: matchDifficulty,
          userId: socket.id
        });

        socket.emit('matchFound', {
          matchId,
          opponent: {
            name: opponent.name,
            rank: opponent.rank,
            avatar: opponent.avatar
          },
          difficulty: matchDifficulty,
          userId: opponent.id
        });
      } else {
        queue.set(socket.id, player);
        socket.emit('waitingForMatch');
      }
    });

    socket.on('cancelMatch', () => {
      if (queue.has(socket.id)) {
        queue.delete(socket.id);
      }
      socket.emit('matchCancelled');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Update socket status to 'waiting' instead of immediately removing
      socketStatus.set(socket.id, { status: 'waiting', lastSeen: Date.now() });
      
      // Remove player from queue if they disconnect
      if (queue.has(socket.id)) {
        queue.delete(socket.id);
      }
      
      // Check if this user was in an active match
      activeMatches.forEach((participants, matchId) => {
        const { player1, player2 } = participants;
        
        if (player1 === socket.id || player2 === socket.id) {
          const otherPlayerId = player1 === socket.id ? player2 : player1;
          
          // Wait for reconnection attempt
          setTimeout(() => {
            const status = socketStatus.get(socket.id);
            if (status && status.status === 'waiting') {
              // Notify other player about disconnect
              io.to(otherPlayerId).emit('opponentQuit', { matchId, userId: socket.id });
              
              // Save the old socket ID for potential reconnection
              if (player1 === socket.id) {
                participants.player1_old = socket.id;
              } else {
                participants.player2_old = socket.id;
              }
              participants.pendingReconnect = socket.id;
              
              // Set final cleanup timeout
              setTimeout(() => {
                if (participants.pendingReconnect) {
                  console.log(`Final cleanup for match ${matchId} after player ${socket.id} failed to reconnect`);
                  cleanupDisconnectedSocket(socket.id, true);
                }
              }, FINAL_CLEANUP_TIMEOUT);
            }
          }, RECONNECT_TIMEOUT);
        }
      });
    });
  });
}

// Helper function to get difficulty level as a number
function getDifficultyLevel(difficulty) {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 1;
    case 'medium': return 2;
    case 'hard': return 3;
    default: return 1;
  }
}

module.exports = { initializeSocket };
