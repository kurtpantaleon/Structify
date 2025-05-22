const queue = new Set();

function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('findMatch', (playerData) => {
      // Add player to queue
      const player = {
        id: socket.id,
        name: playerData.name,
        rank: playerData.rank || 0,
        avatar: playerData.avatar
      };

      // If there's someone in queue, try to match
      if (queue.size > 0) {
        // Get the first player in queue
        const opponent = Array.from(queue)[0];
        queue.delete(opponent);

        // Create a match
        const matchId = `match_${Date.now()}`;
        
        // Notify both players
        io.to(opponent.id).emit('matchFound', {
          matchId,
          opponent: {
            name: player.name,
            rank: player.rank,
            avatar: player.avatar
          }
        });

        socket.emit('matchFound', {
          matchId,
          opponent: {
            name: opponent.name,
            rank: opponent.rank,
            avatar: opponent.avatar
          }
        });
      } else {
        // Add player to queue
        queue.add(player);
        socket.emit('waitingForMatch');
      }
    });

    socket.on('cancelMatch', () => {
      // Remove player from queue if they cancel
      for (const player of queue) {
        if (player.id === socket.id) {
          queue.delete(player);
          break;
        }
      }
      socket.emit('matchCancelled');
    });

    socket.on('disconnect', () => {
      // Remove player from queue if they disconnect
      for (const player of queue) {
        if (player.id === socket.id) {
          queue.delete(player);
          break;
        }
      }
      console.log('User disconnected:', socket.id);
    });
  });
}

module.exports = { initializeSocket };
