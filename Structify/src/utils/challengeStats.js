/**
 * Utilities to track challenge match history and statistics
 */
import { db } from '../services/firebaseConfig';
import { 
  doc, 
  collection, 
  updateDoc, 
  setDoc, 
  addDoc, 
  increment, 
  arrayUnion, 
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Updates user statistics after a match
 * @param {string} userId - The user's ID
 * @param {boolean} isWinner - Whether the user won the match
 * @param {string} matchId - The ID of the match
 * @param {Object} challengeData - Data about the challenge
 * @param {string} opponentId - The opponent's ID
 * @param {number} completionTime - Time taken to complete the challenge (in seconds)
 * @param {string} completionReason - Reason for completion (e.g. 'solved', 'opponent_quit', 'time_up')
 */
export const updateUserStats = async (
  userId, 
  isWinner, 
  matchId, 
  challengeData, 
  opponentId, 
  completionTime, 
  completionReason
) => {
  try {
    if (!userId) {
      console.error('Cannot update stats: No user ID provided');
      return;
    }
    
    const userRef = doc(db, 'users', userId);
    
    // Update basic stats (wins/losses)
    await updateDoc(userRef, {
      [`${isWinner ? 'wins' : 'losses'}`]: increment(1),
      totalMatches: increment(1),
      averageCompletionTime: isWinner ? 
        // Only update average time if user won by solving (not by forfeit)
        (completionReason === 'solved' ? completionTime : null) : 
        null,
      lastMatchDate: serverTimestamp()
    });
    
    // Add to match history
    const matchData = {
      matchId,
      timestamp: serverTimestamp(),
      challengeId: challengeData?.id,
      challengeTitle: challengeData?.title,
      challengeDifficulty: challengeData?.difficulty,
      opponentId,
      isWinner,
      completionTime: isWinner ? completionTime : null,
      reason: completionReason
    };
    
    // Add to user's match history subcollection
    const matchHistoryRef = collection(userRef, 'matchHistory');
    await addDoc(matchHistoryRef, matchData);
    
    console.log(`Updated stats for user ${userId}: ${isWinner ? 'Win' : 'Loss'}`);
    return true;
  } catch (error) {
    console.error('Error updating user stats:', error);
    return false;
  }
};

/**
 * Records a completed match in the global matches collection
 * @param {string} matchId - The ID of the match
 * @param {Object} matchData - Data about the match
 */
export const recordMatchResult = async (matchId, matchData) => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    await setDoc(matchRef, {
      ...matchData,
      timestamp: serverTimestamp()
    });
    
    console.log(`Recorded match result for match ${matchId}`);
    return true;
  } catch (error) {
    console.error('Error recording match result:', error);
    return false;
  }
};

/**
 * Gets a user's match history
 * @param {string} userId - The user's ID
 * @param {number} limit - Maximum number of matches to retrieve
 */
export const getUserMatchHistory = async (userId, limit = 10) => {
  try {
    if (!userId) {
      console.error('Cannot get match history: No user ID provided');
      return [];
    }
    
    // Get match history from user's subcollection
    const { collection, query, getDocs, where, orderBy, limit: limitQuery, getDoc, doc } = await import('firebase/firestore');
    
    // First try to get from user's matchHistory subcollection
    const userMatchesRef = collection(db, 'users', userId, 'matchHistory');
    const userMatchesQuery = query(
      userMatchesRef,
      orderBy('timestamp', 'desc'),
      limitQuery(limit)
    );
    
    const userMatchesSnapshot = await getDocs(userMatchesQuery);
    const matches = [];
    
    if (!userMatchesSnapshot.empty) {
      // Use matchHistory subcollection data
      userMatchesSnapshot.forEach(doc => {
        matches.push({
          id: doc.id,
          ...doc.data()
        });
      });
    } else {
      // Fallback to global matches collection where this user is a participant
      const globalMatchesRef = collection(db, 'matches');
      const player1MatchesQuery = query(
        globalMatchesRef, 
        where('player1', '==', userId),
        orderBy('timestamp', 'desc'),
        limitQuery(Math.ceil(limit/2))
      );
      
      const player2MatchesQuery = query(
        globalMatchesRef, 
        where('player2', '==', userId),
        orderBy('timestamp', 'desc'),
        limitQuery(Math.ceil(limit/2))
      );
      
      const [player1Matches, player2Matches] = await Promise.all([
        getDocs(player1MatchesQuery),
        getDocs(player2MatchesQuery)
      ]);
      
      // Process player1 matches
      player1Matches.forEach(doc => {
        const data = doc.data();
        matches.push({
          id: doc.id,
          matchId: doc.id,
          timestamp: data.timestamp,
          challengeId: data.challengeId,
          challengeTitle: data.challengeTitle || `Challenge #${data.challengeId || ''}`,
          challengeDifficulty: data.difficulty,
          opponentId: data.player2,
          opponentName: 'Opponent',
          isWinner: data.winner === userId,
          completionTime: data.completionTime,
          reason: data.completionReason
        });
      });
      
      // Process player2 matches
      player2Matches.forEach(doc => {
        const data = doc.data();
        matches.push({
          id: doc.id,
          matchId: doc.id,
          timestamp: data.timestamp,
          challengeId: data.challengeId,
          challengeTitle: data.challengeTitle || `Challenge #${data.challengeId || ''}`,
          challengeDifficulty: data.difficulty,
          opponentId: data.player1,
          opponentName: 'Opponent',
          isWinner: data.winner === userId,
          completionTime: data.completionTime,
          reason: data.completionReason
        });
      });
      
      // Sort all matches by timestamp descending
      matches.sort((a, b) => {
        // Handle Firebase Timestamps
        const getTime = (timestamp) => {
          if (timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate().getTime();
          }
          return timestamp ? new Date(timestamp).getTime() : 0;
        };
        
        return getTime(b.timestamp) - getTime(a.timestamp);
      });
      
      // Limit to requested number
      matches.splice(limit);
    }
    
    // If we got no matches from either source, return mock data
    if (matches.length === 0) {
      return [
        {
          matchId: 'match_001',
          timestamp: new Date(),
          challengeId: 1,
          challengeTitle: 'FizzBuzz Challenge',
          challengeDifficulty: 'Easy',
          opponentName: 'UserXYZ',
          isWinner: true,
          completionTime: 73,
          reason: 'solved'
        },
        {
          matchId: 'match_002',
          timestamp: new Date(Date.now() - 86400000),
          challengeId: 3,
          challengeTitle: 'Array Sum',
          challengeDifficulty: 'Easy',
          opponentName: 'Coder123',
          isWinner: false,
          completionTime: null,
          reason: 'opponent_solved'
        }
      ];
    }
    
    return matches;
  } catch (error) {
    console.error('Error getting user match history:', error);
    return [];
  }
};

// Export all functions as named exports
export {
  updateUserStats,
  recordMatchResult,
  getUserMatchHistory
};
