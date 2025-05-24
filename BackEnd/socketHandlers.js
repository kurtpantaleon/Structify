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
  // Run periodic cleanup every 5 minutes to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    
    // Check for stale socket connections (inactive for over 10 minutes)
    socketActivityTimestamps.forEach((timestamp, socketId) => {
      if (now - timestamp > 10 * 60 * 1000) { // 10 minutes
        console.log(`Cleaning up stale socket: ${socketId}`);
        cleanupDisconnectedSocket(socketId, true);
      }
    });
    
    // Check for waiting sockets that have been waiting too long (over 2 minutes)
    socketStatus.forEach((status, socketId) => {
      if (status.status === 'waiting' && (now - status.lastSeen > 2 * 60 * 1000)) {
        console.log(`Socket ${socketId} has been waiting too long, cleaning up`);
        cleanupDisconnectedSocket(socketId, true);
      }
    });
  }, 2 * 60 * 1000); // Every 2 minutes
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Track connection time and status
    socketActivityTimestamps.set(socket.id, Date.now());
    socketStatus.set(socket.id, { status: 'connected', lastSeen: Date.now() });
    
    // Check if this socket was previously in a match
    // This helps with reconnection and maintaining match state
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
      }
    }
    
    // Check for existing players in queue to optimize matchmaking
    if (queue.size > 0) {
      socket.emit('queueUpdate', { position: queue.size });
    }

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
        difficulty: playerData.difficulty || 'Easy' // Default to Easy if not specified
      };      // If there's someone in queue, try to match
      if (queue.size > 0) {
        // Get the first player in queue - properly extract both key and value
        const [opponentId, opponent] = Array.from(queue.entries())[0];
        queue.delete(opponentId);

        // Create a match
        const matchId = `match_${Date.now()}`;
        
        // Track match participants and desired difficulty level
        // Choose the higher difficulty level between the two players
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
          userId: socket.id // Add the socket ID to track disconnections
        });

        socket.emit('matchFound', {
          matchId,
          opponent: {
            name: opponent.name,
            rank: opponent.rank,
            avatar: opponent.avatar
          },
          difficulty: matchDifficulty,
          userId: opponent.id // Add the socket ID to track disconnections
        });      } else {
        // Add player to queue using Map's set method (not add)
        queue.set(socket.id, player);
        socket.emit('waitingForMatch');
      }
    });    socket.on('cancelMatch', () => {
      // Remove player from queue if they cancel - simplified since we use socket.id as key
      if (queue.has(socket.id)) {
        queue.delete(socket.id);
      }
      socket.emit('matchCancelled');
    });socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Update socket status to 'waiting' instead of immediately removing
      socketStatus.set(socket.id, { status: 'waiting', lastSeen: Date.now() });
      
      // Remove player from queue if they disconnect
      if (queue.has(socket.id)) {
        queue.delete(socket.id);
      }
      
      // Check if this user was in an active match
      let wasInMatch = false;
      activeMatches.forEach((participants, matchId) => {
        const { player1, player2 } = participants;
        
        // Store the socket ID for potential reconnection
        if (player1 === socket.id) {
          wasInMatch = true;
          
          // Wait 10 seconds before notifying opponent about disconnect
          setTimeout(() => {
            const status = socketStatus.get(socket.id);
            // If socket is still in waiting state after timeout, consider it gone
            if (status && status.status === 'waiting') {
              // Notify player2 that player1 quit
              io.to(player2).emit('opponentQuit', { matchId, userId: player1 });
              
              // Save the old socket ID but don't clean up match yet
              participants.player1_old = socket.id;
              participants.pendingReconnect = socket.id;
              
              // Set a longer timeout for final cleanup
              setTimeout(() => {
                if (participants.pendingReconnect) {
                  console.log(`Final cleanup for match ${matchId} after player ${socket.id} failed to reconnect`);
                  cleanupDisconnectedSocket(socket.id, true);
                }
              }, 2 * 60 * 1000); // 2 minutes
            }
          }, 10000); // 10 seconds
        }
        
        if (player2 === socket.id) {
          wasInMatch = true;
          
          // Wait 10 seconds before notifying opponent about disconnect
          setTimeout(() => {
            const status = socketStatus.get(socket.id);
            // If socket is still in waiting state after timeout, consider it gone
            if (status && status.status === 'waiting') {
              // Notify player1 that player2 quit
              io.to(player1).emit('opponentQuit', { matchId, userId: player2 });
              
              // Save the old socket ID but don't clean up match yet
              participants.player2_old = socket.id;
              participants.pendingReconnect = socket.id;
              
              // Set a longer timeout for final cleanup
              setTimeout(() => {
                if (participants.pendingReconnect) {
                  console.log(`Final cleanup for match ${matchId} after player ${socket.id} failed to reconnect`);
                  cleanupDisconnectedSocket(socket.id, true);
                }
              }, 2 * 60 * 1000); // 2 minutes
            }
          }, 10000); // 10 seconds
        }
      });
      
      // If not in a match, clean up immediately
      if (!wasInMatch) {
        cleanupDisconnectedSocket(socket.id);
      }
    });
    
    // Handle challenge related events
    socket.on('challengeSelected', ({ matchId, challengeId, difficulty }) => {
      // Store the selected challenge for this match
      if (!matchChallenges.has(matchId)) {
        // Get the match difficulty if available
        const match = activeMatches.get(matchId);
        const matchDifficulty = match ? match.difficulty : difficulty || 'Easy';
        
        // If a specific challenge ID is provided by client, validate it
        // Otherwise, select a random challenge of appropriate difficulty
        if (challengeId) {
          matchChallenges.set(matchId, challengeId);
        } else {
          // This would be implemented on the server-side if you had challenges in the backend
          // For now, we'll just use the client-provided difficulty
          matchChallenges.set(matchId, { difficulty: matchDifficulty });
        }
        
        console.log(`Match ${matchId} selected challenge with difficulty ${matchDifficulty}`);
      }
      
      // Send the challenge ID to the client that requested it
      // If this is the second player, they will get the same challenge as the first player
      socket.emit('assignChallenge', { 
        matchId,
        challengeId: matchChallenges.get(matchId),
        difficulty: activeMatches.get(matchId)?.difficulty || 'Easy'
      });
    });
      socket.on('updateProgress', ({ matchId, userId, progress, completed }) => {
      if (activeMatches.has(matchId)) {
        const { player1, player2 } = activeMatches.get(matchId);
        const targetPlayer = userId === player1 ? player2 : player1;
        
        // Forward progress to opponent
        io.to(targetPlayer).emit('opponentProgress', {
          matchId,
          progress,
          completed
        });
          // If challenge completed, update match state
        if (completed) {
          // Notify both players that the match has ended
          io.to(player1).emit('matchEnded', { matchId, winnerUid: userId });
          io.to(player2).emit('matchEnded', { matchId, winnerUid: userId });

          activeMatches.delete(matchId); // Close the match
          matchChallenges.delete(matchId); // Clean up challenge data
        }
      }
    });
    
    // Handle heartbeat messages to keep connection alive
    socket.on('heartbeat', ({ matchId }) => {
      // Update activity timestamp
      socketActivityTimestamps.set(socket.id, Date.now());
      
      // Update socket status to connected
      socketStatus.set(socket.id, { status: 'connected', lastSeen: Date.now() });
      
      // If this socket was in waiting state for reconnection, handle the reconnection
      if (matchId && activeMatches.has(matchId)) {
        const match = activeMatches.get(matchId);
        
        // Check if this socket was pending reconnection
        if (match.pendingReconnect === socket.id) {
          console.log(`Reconnected socket ${socket.id} to match ${matchId} via heartbeat`);
          
          // Update the match with the reconnected socket
          if (match.player1_old === socket.id) {
            match.player1 = socket.id;
            delete match.player1_old;
          } else if (match.player2_old === socket.id) {
            match.player2 = socket.id;
            delete match.player2_old;
          }
          
          delete match.pendingReconnect;
          
          // Notify the other player that the opponent has reconnected
          const otherPlayer = match.player1 === socket.id ? match.player2 : match.player1;
          io.to(otherPlayer).emit('opponentReconnected', { matchId });
        }
      }
    });
  });
}

module.exports = { initializeSocket };

// Helper function to convert difficulty strings to numeric levels for comparison
function getDifficultyLevel(difficulty) {
  switch(difficulty) {
    case 'Easy': return 1;
    case 'Medium': return 2;
    case 'Hard': return 3;
    default: return 1; // Default to Easy
  }
}
