import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import profile from '../assets/images/sample profile.png';
import ButtonBg from '../assets/images/ButtonBg.png';
import HistoryBg from '../assets/images/challngeBg.png';
import fireIcon from '../assets/images/fire.png';
import select from '../assets/images/select.png';
import icon from '../assets/images/select-icon.png';
import Match from '../pages/PvP/Match';
import { getSocket, reconnectSocket } from '../services/socketService';

const styles = {
  challengeButton: "w-90 py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-x-2 shadow-lg shadow-blue-600/40 hover:shadow-blue-600/70 transition duration-300 ease-in-out bg-no-repeat"
};

// Default match history in case there's no data in the database
const defaultMatches = [
  {
    player1: { name: 'Bretana', avatar: profile, rank: 990 },
    player2: { name: 'Pantaleon', avatar: profile, rank: 122 },
    winner: 'player1',
    date: new Date().toISOString()
  },
  {
    player1: { name: 'Astra', avatar: profile, rank: 512 },
    player2: { name: 'Nova', avatar: profile, rank: 680 },
    winner: 'player2',
    date: new Date(Date.now() - 86400000).toISOString() // Yesterday
  }
];

export default function CodeChallengeLobby() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [searchTime, setSearchTime] = useState(0);
  const [opponent, setOpponent] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const { currentUser: user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showTestPanel, setShowTestPanel] = useState(process.env.NODE_ENV !== 'production');
  const [matchHistory, setMatchHistory] = useState([]);
  const [winMessage, setWinMessage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Add useLocation hook
  const { state } = navigate?.location || {}; // Access navigation state if available
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Check for win message in navigation state
  useEffect(() => {
    if (location?.state?.message && location?.state?.win) {
      setWinMessage(location.state.message);
      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setWinMessage(null);
        // Also clear the navigation state
        navigate(location.pathname, { replace: true });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);
    // Fetch user stats and match history
  useEffect(() => {
    const fetchUserStats = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserStats({
              name: userData.name || user.email?.split('@')[0] || 'User',
              rank: userData.rank || 0,
              avatar: userData.avatar || profile,
              wins: userData.wins || 0,
              losses: userData.losses || 0,
              skillLevel: userData.skillLevel || 'beginner'
            });
          } else {
            console.log('No user document found');
            setUserStats({
              name: user.email?.split('@')[0] || 'User',
              rank: 0,
              avatar: profile,
              wins: 0,
              losses: 0,
              skillLevel: 'beginner'
            });
          }
          
          // Fetch real match history
          setHistoryLoading(true);
          try {
            // Import the getUserMatchHistory function
            const { getUserMatchHistory } = await import('../utils/challengeStats.js');
            
            // Get real match history from Firestore through our utility function
            const userHistory = await getUserMatchHistory(user.uid, 5);
            
            if (userHistory && userHistory.length > 0) {
              // Transform the raw match data into the expected format for display
              const formattedHistory = await Promise.all(userHistory.map(async (match) => {
                // Try to get opponent info
                let opponentName = match.opponentName || 'Unknown Player';
                let opponentAvatar = profile;
                let opponentRank = 0;
                
                try {
                  if (match.opponentId) {
                    const opponentDoc = await getDoc(doc(db, 'users', match.opponentId));
                    if (opponentDoc.exists()) {
                      const opponentData = opponentDoc.data();
                      opponentName = opponentData.name || match.opponentName || 'Unknown Player';
                      opponentAvatar = opponentData.avatar || profile;
                      opponentRank = opponentData.rank || 0;
                    }
                  }
                } catch (err) {
                  console.error('Error fetching opponent data:', err);
                }
                
                // Create the formatted match object
                return {
                  player1: { 
                    name: userStats?.name || 'You', 
                    avatar: userStats?.avatar || profile, 
                    rank: userStats?.rank || 0 
                  },
                  player2: { 
                    name: opponentName, 
                    avatar: opponentAvatar, 
                    rank: opponentRank 
                  },
                  winner: match.isWinner ? 'player1' : 'player2',
                  date: match.timestamp ? match.timestamp.toDate().toISOString() : new Date().toISOString(),
                  challengeTitle: match.challengeTitle,
                  challengeDifficulty: match.challengeDifficulty
                };
              }));
              
              setMatchHistory(formattedHistory);
            } else {
              // If there's no history yet, use default matches
              const userDisplayName = userDoc.exists() ? 
                userDoc.data().name || user.email?.split('@')[0] :
                user.email?.split('@')[0] || 'User';
              
              setMatchHistory(defaultMatches.map(match => ({
                ...match,
                player1: match.player1.name === 'Bretana' ? 
                  { ...match.player1, name: userDisplayName, avatar: userDoc.exists() ? userDoc.data().avatar || profile : profile } : 
                  match.player1
              })));
            }
          } catch (historyError) {
            console.error('Error fetching match history:', historyError);
            // Fall back to default matches if history fetch fails
            setMatchHistory(defaultMatches);
          } finally {
            setHistoryLoading(false);
          }
        } catch (error) {
          console.error('Error fetching user stats:', error);
          setError('Failed to load user data');
          setMatchHistory(defaultMatches);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setMatchHistory(defaultMatches);
      }
    };

    fetchUserStats();
  }, [user]);  

  // Socket connection and events handling  
  useEffect(() => {
    // Get or create socket connection
    const socket = getSocket();
    
    // Connection event handlers
    const handleConnect = () => {
      console.log('Socket connected successfully');
      setConnectionStatus('connected');
      setError(null);
    };
    
    const handleConnectError = (err) => {
      console.error('Socket connection error:', err);
      setConnectionStatus('error');
      setError('Failed to connect to matchmaking server. Retrying...');
    };
    
    const handleDisconnect = (reason) => {
      console.log('Socket disconnected:', reason);
      setConnectionStatus('disconnected');
      
      if (isSearching) {
        setIsSearching(false);
        setError('Connection lost during matchmaking. Please try again.');
      }
    };
    
    // Matchmaking event handlers
    const handleWaitingForMatch = () => {
      setIsSearching(true);
      setError(null);
    };

    const handleMatchFound = (data) => {
      console.log('Match found with:', data);
      setIsSearching(false);
      setOpponent(data.opponent);
        // Navigate to the game page with match data
      navigate('/PvP/Match', { 
        state: { 
          matchId: data.matchId,
          opponent: data.opponent,
          user: userStats // Include user data for the match
        },
        replace: true // Ensure we can't go back to the lobby
      });
    };

    const handleMatchCancelled = () => {
      setIsSearching(false);
      setOpponent(null);
      setSearchTime(0);
    };
    
    const handleMatchError = (error) => {
      console.error('Match error:', error);
      setIsSearching(false);
      setError(error.message || 'An error occurred during matchmaking');
    };

    const handleQueueUpdate = (data) => {
      console.log('Queue update:', data);
      // You can add queue position or waiting time display here
    };
    
    // Try to connect if not already connected
    if (!socket.connected) {
      reconnectSocket();
    }
    
    // Register all socket events
    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('disconnect', handleDisconnect);
    socket.on('waitingForMatch', handleWaitingForMatch);
    socket.on('matchFound', handleMatchFound);
    socket.on('matchCancelled', handleMatchCancelled);
    socket.on('matchError', handleMatchError);
    socket.on('queueUpdate', handleQueueUpdate);
    
    // Add heartbeat for keep-alive
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        console.log('Sending heartbeat to server');
        socket.emit('heartbeat', {});
      } else if (connectionStatus !== 'error') {
        console.log('Socket disconnected, attempting to reconnect');
        reconnectSocket();
      }
    }, 30000); // every 30 seconds
    
    // Cleanup on unmount
    return () => {
      // Remove all event listeners
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('disconnect', handleDisconnect);
      socket.off('waitingForMatch', handleWaitingForMatch);
      socket.off('matchFound', handleMatchFound);
      socket.off('matchCancelled', handleMatchCancelled);
      socket.off('matchError', handleMatchError);
      socket.off('queueUpdate', handleQueueUpdate);
      
      // Cancel ongoing search if component unmounts
      if (isSearching) {
        socket.emit('cancelMatch');
      }
      
      // Clear the heartbeat interval
      clearInterval(heartbeatInterval);
    };
  }, [navigate, isSearching, userStats]);

  // Timer for tracking search time
  useEffect(() => {
    let timer;
    if (isSearching) {
      timer = setInterval(() => {
        setSearchTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      setSearchTime(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSearching]);
    // Find Match handler
  const handleFindMatch = () => {
    console.log('Find Match button clicked');
    
    // Get the socket using our centralized service
    const socket = getSocket();
    
    // Check if we need to reconnect
    if (!socket.connected) {
      console.log('Socket not connected, attempting to reconnect...');
      reconnectSocket();
      
      // Show an error message and retry after reconnecting
      setError('Connecting to matchmaking server...');
      
      // Set up a one-time listener for reconnection
      socket.io.once('reconnect', () => {
        console.log('Reconnected, now attempting to find match');
        // Clear any error messages
        setError(null);
        // Try finding match again
        handleFindMatch();
      });
      
      return;
    }

    if (!user || !user.uid) {
      console.error('User data is not available');
      setError('User data is not available');
      return;
    }

    if (!userStats) {
      setError('Your profile data is still loading');
      return;
    }

    setIsSearching(true);
    console.log('Emitting findMatch event with user data:', userStats);
    
    socket.emit('findMatch', {
      name: userStats.name,
      rank: userStats.rank,
      avatar: userStats.avatar,
      userId: user.uid, // Extra data for our tracking purposes
      difficulty: 'Easy' // You can make this selectable by users in the future
    });
  };
    // Handler to cancel match search
  const handleCancelSearch = () => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('cancelMatch');
    }
    setIsSearching(false);
    setSearchTime(0);
  };
  // Queue updates are already handled in the main socket setup
  // Format time for display in the searching UI
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-[#0c1836] text-white p-4">      <h1 className="text-4xl font-bold mb-8 bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 text-transparent">
        PvP Arena
      </h1>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-lg">Loading your profile data...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-[#0c1836] text-white p-4">      <h1 className="text-4xl font-bold mb-8 bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 text-transparent">
        PvP Arena
      </h1>
      
      {winMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-600 text-white px-6 py-3 rounded-md mb-6 shadow-lg border border-green-500 flex items-center"
        >
          <div className="mr-3 p-2 bg-white rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-medium">{winMessage}</span>
        </motion.div>
      )}
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500 text-white px-6 py-3 rounded-md mb-6 shadow-lg border border-red-400"
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        </motion.div>
      )}

      <div className="mb-6 bg-gray-800 px-4 py-2 rounded-full shadow-inner">
        <div className="flex items-center space-x-2">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
            connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
            connectionStatus === 'error' ? 'bg-red-500' :
            'bg-yellow-500'
          }`}></span>
          <span className="font-medium">
            {connectionStatus === 'connected' ? 'Server Online' : 
             connectionStatus === 'error' ? 'Connection Error' : 
             'Connecting...'}
          </span>
        </div>
      </div>
        <div className="mb-8 animate-fadeIn">
        
      </div>{isSearching && (
        <div 
          className="mt-4 text-center bg-blue-900/30 p-6 rounded-xl border border-blue-500/30 shadow-lg animate-fadeIn"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-xl font-medium">Searching for an opponent...</p>
          <p className="text-sm text-blue-300 mt-1">Time elapsed: {formatTime(searchTime)}</p>
          
          <button
            onClick={handleCancelSearch}
            className="mt-4 px-6 py-2 bg-red-500/70 hover:bg-red-500 rounded-lg text-white font-medium transition duration-200"
          >
            Cancel Search
          </button>
        </div>
      )}      <div 
        className="bg-[#1e2a6b] rounded-2xl shadow-xl p-8 w-full max-w-4xl space-y-6 border-4 border-blue-800 animate-fadeIn"
      >
        <h2 className="text-2xl font-semibold text-center">An Opponent to test your might</h2>        <div 
          className="flex justify-between items-center border-4 border-blue-500 h-60 rounded-2xl overflow-hidden bg-cover bg-no-repeat bg-center shadow-lg" 
          style={{ backgroundImage: `url(${select})` }}
        >          <div
            className="flex flex-col items-center justify-center w-1/2 p-4 space-y-3 hover:scale-105 transition-transform duration-300"
          >            
            {/* User Profile */}
            <div className="relative">
              <img 
                src={userStats?.avatar || profile} 
                alt={`${userStats?.name || 'User'} avatar`} 
                className="w-20 h-20 rounded-full border-4 border-white shadow-xl" 
              />
              {userStats?.wins > 0 && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white">
                  {userStats.wins}W
                </div>
              )}
            </div>
            <span className="text-xl font-bold text-white drop-shadow-md">{userStats?.name || 'Loading...'}</span>
            {userStats && (
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1 text-sm text-blue-300">
                  <span className="font-semibold">{userStats.rank}</span>
                  <span>Rating</span>
                </div>
                <div className="flex items-center mt-1 space-x-2">
                  <span className="text-xs text-green-400">{userStats.wins} Wins</span>
                  {userStats.losses > 0 && (
                    <>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-red-400">{userStats.losses} Losses</span>
                    </>
                  )}
                </div>              </div>
            )}
          </div>
          
          {/* Opponent Selection Button */}
          <button 
            className="w-1/2 flex flex-col items-center justify-center p-4 space-y-3 cursor-pointer relative hover:scale-105 transition-transform duration-300"
            aria-label="Select Opponent"
          >
            <div 
              className="rounded-full w-20 h-20 bg-blue-900 shadow-lg flex items-center justify-center border-4 border-blue-400 relative overflow-hidden"
            >
              <img 
                src={icon} 
                alt="Select opponent" 
                className="w-16 h-16 object-cover"
              />
              <div className="absolute inset-0 bg-blue-500 opacity-20 animate-pulse"></div>
            </div>
            <span className="text-xl font-bold text-white drop-shadow-md">Find Opponent</span>
            
          </button>
        </div><div className="flex justify-center items-center p-3 mt-2">
          <motion.button
            onClick={handleFindMatch}
            disabled={isSearching || connectionStatus !== 'connected'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${styles.challengeButton} ${
              isSearching || connectionStatus !== 'connected'
                ? 'opacity-70 cursor-not-allowed'
                : 'hover:shadow-blue-600/70'
            }`}
            style={{
              backgroundImage: `url(${ButtonBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {isSearching ? 'Finding Match...' : 'Find Match'}
          </motion.button>
        </div>
      </div>
      
      <div 
        className="bg-[#1e2a6b] rounded-2xl shadow-xl p-8 w-full max-w-4xl space-y-4 border-4 border-blue-800 mt-6 animate-fadeIn"
      >
        <div className="flex items-center justify-center mb-2">
          <div className="h-1 w-16 bg-blue-400 rounded-full mr-4"></div>
          <h2 className="text-2xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">Match History</h2>
          <div className="h-1 w-16 bg-blue-400 rounded-full ml-4"></div>
        </div>
          {matchHistory.length === 0 ? (
          <div className="text-center py-8 text-blue-300">
            <p className="text-lg">No match history available</p>
            <p className="text-sm mt-2">Play some matches to see your history here!</p>
          </div>
        ) : (
          matchHistory.map((match, idx) => (
           <motion.div
  key={idx}
  whileHover={{ scale: 1.02 }}
  className="relative border-2 border-blue-600 rounded-xl p-4 bg-cover bg-no-repeat bg-center shadow-md overflow-hidden flex flex-col justify-between"
  style={{ backgroundImage: `url(${HistoryBg})` }}
>
  {/* Challenge Info - New section */}
  {match.challengeTitle && (
    <div className="mb-2 flex justify-between items-center text-sm">
      <div className="flex items-center">
        <span className="text-blue-300 font-semibold mr-1">Challenge:</span> 
        <span className="text-white">{match.challengeTitle}</span>
      </div>
      {match.challengeDifficulty && (
        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
          match.challengeDifficulty === 'Easy' ? 'bg-green-600/60' : 
          match.challengeDifficulty === 'Medium' ? 'bg-yellow-600/60' : 
          'bg-red-600/60'
        }`}>
          {match.challengeDifficulty}
        </span>
      )}
    </div>
  )}

  <div className="relative z-10 flex justify-between items-center">
    {/* Player 1 */}
    <div className="flex items-center space-x-3 min-w-[40%]">
      <img
        src={match.player1.avatar}
        alt={match.player1.name}
        className="w-10 h-10 rounded-full border-2 border-white"
      />
      <span
        className={`font-bold text-lg ${
          match.winner === 'player1' ? 'text-yellow-300' : 'text-white'
        }`}
      >
        {match.player1.name} {match.winner === 'player1' ? '👑' : ''}
      </span>
      <div className="flex items-center space-x-1 text-lg text-white/70">
        <img src={fireIcon} alt="rank" className="w-6 h-6" />
        <span>{match.player1.rank}</span>
      </div>
    </div>

   
    <div className="relative flex items-center justify-center px-4">
      <div className="px-3 py-1 bg-blue-900/50 rounded-full border border-blue-500/30 text-sm font-medium select-none flex items-center justify-center">
        {/* Sword Icon SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 19l-6-6 6-6m6 0l6 6-6 6M9 13l6-6"
          />
        </svg>
      </div>
    </div>

    {/* Player 2 */}
    <div className="flex items-center space-x-3 min-w-[40%] justify-end">
      <div className="flex items-center space-x-1 text-lg text-white/70">
        <span>{match.player2.rank}</span>
        <img src={fireIcon} alt="rank" className="w-6 h-6" />
      </div>
      <span
        className={`font-bold text-lg ${
          match.winner === 'player2' ? 'text-yellow-300' : 'text-white'
        }`}
      >
        {match.player2.name} {match.winner === 'player2' ? '👑' : ''}
      </span>
      <img
        src={match.player2.avatar}
        alt={match.player2.name}
        className="w-10 h-10 rounded-full border-2 border-white"
      />
    </div>
  </div>

  <div className="flex justify-between items-center mt-2 text-xs">
    {/* Match Date */}
    <div className="text-blue-300 select-none">
      {new Date(match.date).toLocaleDateString()}
    </div>
    
    {/* Completion Time if available */}
    {match.winner === 'player1' && match.completionTime && (
      <div className="text-green-300">
        Solved in {Math.floor(match.completionTime / 60)}:{(match.completionTime % 60).toString().padStart(2, '0')}
      </div>
    )}
  </div>
</motion.div>


          ))
        )}
      </div>
    </div>
  );
}