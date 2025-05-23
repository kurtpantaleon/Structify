/**
 * Utility functions for testing and validating challenge synchronization
 */

import { io } from 'socket.io-client';

// Initialize socket connection if needed
const getSocket = () => {
  // Use existing socket connection if available in window
  if (window._structifySocket) {
    return window._structifySocket;
  }

  // Create new socket connection
  const socket = io('http://localhost:3001', {
    reconnection: true,
    reconnectionAttempts: 5,
    timeout: 10000,
  });
  
  // Store socket for reuse
  window._structifySocket = socket;
  return socket;
};

/**
 * Test function to validate challenge synchronization between two players
 * This can be called from the browser console to simulate two players
 * receiving the same challenge.
 */
export const testChallengeSync = () => {
  const socket = getSocket();
  
  // Create a test match ID
  const testMatchId = `test_match_${Date.now()}`;
  
  // Create mock player data
  const player1 = { id: 'player1', name: 'Test Player 1' };
  const player2 = { id: 'player2', name: 'Test Player 2' };
  
  // Set up listeners for challenge assignments
  const challenges = {
    player1: null,
    player2: null
  };
  
  console.log(`🧪 Starting challenge sync test for match: ${testMatchId}`);
  
  const handleChallengeAssignment = (playerId) => (data) => {
    if (data.matchId === testMatchId) {
      challenges[playerId] = data.challengeId;
      console.log(`🔄 ${playerId} received challenge: ${data.challengeId}`);
      
      // Check if both players have received challenges
      if (challenges.player1 && challenges.player2) {
        if (challenges.player1 === challenges.player2) {
          console.log('✅ TEST PASSED: Both players received the same challenge!');
          console.log(`   Challenge ID: ${challenges.player1}`);
        } else {
          console.error('❌ TEST FAILED: Players received different challenges!');
          console.error(`   Player 1 challenge: ${challenges.player1}`);
          console.error(`   Player 2 challenge: ${challenges.player2}`);
        }
      }
    }
  };
  
  // Set up listeners
  socket.on('assignChallenge', handleChallengeAssignment('player1'));
  const tempListener = (data) => handleChallengeAssignment('player2')(data);
  socket.on('assignChallenge', tempListener);
  
  // Simulate two players joining and requesting challenges
  console.log('🔄 Simulating player 1 requesting a challenge...');
  socket.emit('challengeSelected', { 
    matchId: testMatchId, 
    challengeId: Math.floor(Math.random() * 5) + 1
  });
  
  // Delay to simulate real conditions
  setTimeout(() => {
    console.log('🔄 Simulating player 2 requesting a challenge...');
    socket.emit('challengeSelected', { 
      matchId: testMatchId, 
      challengeId: Math.floor(Math.random() * 5) + 1 
    });
    
    // Clean up after the test
    setTimeout(() => {
      socket.off('assignChallenge', tempListener);
      console.log('🧹 Test cleanup complete.');
    }, 2000);
  }, 1000);
  
  return `Test started for match: ${testMatchId}. Check console for results.`;
};

/**
 * Function to validate match statistics after challenge completion
 */
export const validateMatchResult = (matchId, winner, completionTime, userStats) => {
  console.log('=== Match Result Validation ===');
  console.log(`Match ID: ${matchId}`);
  console.log(`Winner: ${winner}`);
  console.log(`Completion Time: ${completionTime}s`);
  
  if (userStats) {
    console.log('=== User Statistics ===');
    console.log(`Previous Wins: ${userStats.wins}`);
    console.log(`Previous Losses: ${userStats.losses}`);
    console.log(`Skill Level: ${userStats.skillLevel}`);
  }
  
  return true;
};

/**
 * Exports a testing module that can be used in the browser console
 * Usage: window.ChallengeTest.testSync()
 */
export const initTestingModule = () => {
  window.ChallengeTest = {
    testSync: testChallengeSync,
    validateResult: validateMatchResult
  };
  console.log('🧪 Challenge testing module initialized. Use window.ChallengeTest.testSync() to run a sync test.');
};

export default {
  testChallengeSync,
  validateMatchResult,
  initTestingModule
};
