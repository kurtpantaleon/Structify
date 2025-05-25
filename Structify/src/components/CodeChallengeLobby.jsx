// filepath: f:\repo\Structify\Structify\src\components\CodeChallengeLobby.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/firebaseConfig';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import profile from '../assets/images/sample profile.png';
import ButtonBg from '../assets/images/ButtonBg.png';
import HistoryBg from '../assets/images/challngeBg.png';
import fireIcon from '../assets/images/fire.png';
import select from '../assets/images/select.png';
import icon from '../assets/images/select-icon.png';
import Match from '../pages/PvP/Match';
import { getSocket, reconnectSocket } from '../services/socketService';
import BackgroundSound from './BackgroundSound';

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
  const [_opponent, setOpponent] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchHistory, setMatchHistory] = useState([]);
  const [_historyLoading, setHistoryLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser: user } = useAuth();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  
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
          
          // Fetch real match history from Firestore
          setHistoryLoading(true);
          try {
            const matchesRef = collection(db, 'matches');
            const q1 = query(matchesRef, where('player1.uid', '==', user.uid));
            const q2 = query(matchesRef, where('player2.uid', '==', user.uid));
            const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
            const matches = [];
            snap1.forEach(doc => matches.push({ id: doc.id, ...doc.data(), isPlayer1: true }));
            snap2.forEach(doc => matches.push({ id: doc.id, ...doc.data(), isPlayer1: false }));
            // Sort by endedAt descending
            matches.sort((a, b) => {
              const aTime = a.endedAt?.seconds || 0;
              const bTime = b.endedAt?.seconds || 0;
              return bTime - aTime;
            });
            setMatchHistory(matches);
          } catch (historyError) {
            console.error('Error fetching match history:', historyError);
            setMatchHistory([]);
          } finally {
            setHistoryLoading(false);
          }
        } catch (error) {
          console.error('Error fetching user stats:', error);
          setError('Failed to load user data');
          setMatchHistory([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setMatchHistory([]);
      }
    };

    fetchUserStats();
  }, [user]);
  
  // Socket connection and events handling
  useEffect(() => {
    // Get socket instance from our service
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
      console.log('Match found:', data);
      setIsSearching(false);
      navigate(`/PvP/Match`, { 
        state: { 
          matchData: data,
          userStats: userStats
        }
      });
    };
    
    const handleMatchCancelled = () => {
      console.log('Match cancelled');
      setIsSearching(false);
      setError('Match cancelled');
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
    
    // Register all event handlers
    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('disconnect', handleDisconnect);
    socket.on('waitingForMatch', handleWaitingForMatch);
    socket.on('matchFound', handleMatchFound);
    socket.on('matchCancelled', handleMatchCancelled);
    socket.on('matchError', handleMatchError);
    socket.on('queueUpdate', handleQueueUpdate);
    
    // Try to connect if not already connected
    if (!socket.connected) {
      reconnectSocket();
    }
    
    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('disconnect', handleDisconnect);
      socket.off('waitingForMatch', handleWaitingForMatch);
      socket.off('matchFound', handleMatchFound);
      socket.off('matchCancelled', handleMatchCancelled);
      socket.off('matchError', handleMatchError);
      socket.off('queueUpdate', handleQueueUpdate);
      
      if (isSearching) {
        socket.emit('cancelMatch');
      }
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
    
    const socket = getSocket();
    if (!socket.connected) {
      console.error('Socket is not connected');
      setError('Not connected to matchmaking server');
      reconnectSocket();
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
      userId: user.uid // Extra data for our tracking purposes
    });
  };
  
  // Handler to cancel match search
  const handleCancelSearch = () => {
    const socket = getSocket();
    socket.emit('cancelMatch');
    setIsSearching(false);
  };
  
  // Handler to exit to main page
  const handleExit = () => {
    if (isSearching) {
      const socket = getSocket();
      socket.emit('cancelMatch');
    }
    navigate('/MainPage');
  };

  // Format time for display in the searching UI
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  useEffect(() => {
    if (location.state && location.state.winnerUid) {
      if (user && location.state.winnerUid === user.uid) {
        setModalType('win');
      } else {
        setModalType('lose');
      }
      setShowModal(true);
      // Optionally clear the state after showing the modal
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-[#0c1836] text-white p-4">
        <h1 className="text-4xl font-bold mb-8 bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 text-transparent">
          PvP Arena
        </h1>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-lg">Loading your profile data...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-[#0c1836] text-white p-4">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 text-transparent">
        PvP Arena
      </h1>
      
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
        
      <div className="mb-8 animate-fadeIn"></div>
      
      {isSearching && (
        <div className="fixed inset-0 flex items-center justify-center bg-blue-900/30 backdrop-blur-sm z-50">
          <div className="text-center bg-blue-900/90 p-8 rounded-xl border border-blue-500/30 shadow-lg animate-fadeIn min-w-[320px]">
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
        </div>
      )}
      
      <div 
        className="bg-[#1e2a6b] rounded-2xl shadow-xl p-8 w-full max-w-2xl space-y-6 border-4 border-blue-800 animate-fadeIn"
      >
        <h2 className="text-2xl font-semibold text-center">An Opponent to test your might</h2>
        
        <div 
          className="flex justify-between items-center border-4 border-blue-500 h-60 rounded-2xl overflow-hidden bg-cover bg-no-repeat bg-center shadow-lg" 
          style={{ backgroundImage: `url(${select})` }}
        >
          <div
            className="flex flex-col items-center justify-center w-1/2 p-4 space-y-3 hover:scale-105 transition-transform duration-300"
          >
            {/* User Profile */}
            <div className="relative">
              <img 
                src={userStats?.avatar || profile} 
                alt={`${userStats?.name || 'User'} avatar`} 
                className="w-20 h-20 rounded-full border-4 border-white shadow-xl" 
              />
            </div>
            <span className="text-xl font-bold text-white drop-shadow-md">{userStats?.name || 'Loading...'}</span>
            {userStats && (
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1 text-sm text-blue-300">
                  <span className="font-semibold">{userStats.rank}</span>
                  <span>Rating</span>
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-xs px-2 py-1 bg-blue-800/60 rounded-md text-white">
                    {userStats.skillLevel || 'beginner'}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div 
            className="flex flex-col items-center justify-center w-1/2 p-4 space-y-3 hover:scale-105 transition-transform duration-300"
            aria-label="Select Opponent"
          >
            <div className="rounded-full w-20 h-20 bg-blue-900 shadow-lg flex items-center justify-center border-4 border-blue-400 relative overflow-hidden">
              <img 
                src={icon} 
                alt="Select opponent" 
                className="w-16 h-16 object-cover"
              />
              <div className="absolute inset-0 bg-blue-500 opacity-20 animate-pulse"></div>
            </div>
            <span className="text-xl font-bold text-white drop-shadow-md">Find Opponent</span>
            <p className="text-xs text-blue-300 max-w-[180px] text-center">
              Click "Find Match" to get randomly matched with an opponent of similar skill.
            </p>
          </div>
        </div>
        
        <div className="flex justify-center items-center p-3 mt-2">
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
        className="bg-[#1e2a6b] rounded-2xl shadow-xl p-8 w-full max-w-2xl space-y-4 border-4 border-blue-800 mt-6 animate-fadeIn"
      >
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center justify-center">
            <div className="h-1 w-16 bg-blue-400 rounded-full mr-4"></div>
            <h2 className="text-2xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">Match History</h2>
            <div className="h-1 w-16 bg-blue-400 rounded-full ml-4"></div>
          </div>
          
          {userStats && (
            <div className="mt-2 flex items-center justify-center bg-blue-900/40 px-4 py-2 rounded-full border border-blue-600/30">
              <div className="flex items-center">
                <span className="font-bold text-green-400 mr-1">{userStats.wins}</span>
                <span className="text-sm text-green-300 mr-3">Wins</span>
                {userStats.losses > 0 && (
                  <>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="font-bold text-red-400 mr-1">{userStats.losses}</span>
                    <span className="text-sm text-red-300">Losses</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {matchHistory.length === 0 ? (
          <div className="text-center py-8 text-blue-300">
            <p className="text-lg">No match history available</p>
            <p className="text-sm mt-2">Play some matches to see your history here!</p>
          </div>
        ) : (
          matchHistory.map((match, idx) => {
            const userIsWinner = match.winnerUid === user?.uid;
            const opponent = match.isPlayer1 ? match.player2 : match.player1;
            const opponentIsWinner = match.winnerUid === opponent?.uid && opponent?.uid !== 'unknown';
            
            // Simplified label logic - if there's a winnerUid, we know who won
            const userLabel = userIsWinner ? 'Winner' : 'Loser';
            const opponentLabel = opponentIsWinner ? 'Winner' : 'Loser';

            // Determine left and right players based on who won
            const leftPlayer = userIsWinner ? userStats : opponent;
            const rightPlayer = userIsWinner ? opponent : userStats;
            const leftLabel = userIsWinner ? userLabel : opponentLabel;
            const rightLabel = userIsWinner ? opponentLabel : userLabel;

            return (
              <motion.div
                key={match.id}
                whileHover={{ scale: 1.02 }}
                className="relative border-2 border-blue-600 rounded-xl p-4 bg-cover bg-center shadow-md overflow-hidden mb-4"
                style={{ backgroundImage: `url(${HistoryBg})` }}
              >
                <div className="absolute inset-0 bg-opacity-50 rounded-xl"></div>
                <div className="relative z-10 flex justify-between items-center">
                  {/* Left Player (Winner) */}
                  <div className="flex flex-col items-center">
                    <img src={leftPlayer?.avatar || profile} alt={leftPlayer?.name} className="w-10 h-10 rounded-full border-2 border-white" />
                    <span className="font-bold text-lg">{leftPlayer?.name}</span>
                    <div className="flex items-center mt-1">
                      <img src={fireIcon} alt="rank" className="w-5 h-5 mr-1" />
                      <span className="font-semibold text-white text-sm">{leftPlayer?.rank}</span>
                    </div>
                    <span className={`mt-1 text-xs font-semibold ${leftLabel === 'Winner' ? 'text-green-400' : leftLabel === 'Loser' ? 'text-red-400' : 'text-gray-400'}`}>{leftLabel}</span>
                  </div>
                  {/* VS */}
                  <div className="px-4 py-1 bg-blue-900/50 rounded-full border border-blue-500/30 text-lg font-bold text-white mx-3">
                    VS
                  </div>
                  {/* Right Player (Loser) */}
                  <div className="flex flex-col items-center">
                    <img src={rightPlayer?.avatar || profile} alt={rightPlayer?.name} className="w-10 h-10 rounded-full border-2 border-white" />
                    <span className="font-bold text-lg">{rightPlayer?.name}</span>
                    <div className="flex items-center mt-1">
                      <img src={fireIcon} alt="rank" className="w-5 h-5 mr-1" />
                      <span className="font-semibold text-white text-sm">{rightPlayer?.rank || ''}</span>
                    </div>
                    <span className={`mt-1 text-xs font-semibold ${rightLabel === 'Winner' ? 'text-green-400' : rightLabel === 'Loser' ? 'text-white-400' : 'text-gray-400'}`}>{rightLabel}</span>
                  </div>
                </div>
                <div className="mt-3 flex justify-between items-center text-xs">
                  <div className="text-left text-blue-300">
                    {match.difficulty && (
                      <span className="bg-blue-800/60 px-2 py-1 rounded-md mr-2">
                        {match.difficulty}
                      </span>
                    )}
                    {match.completionTime && (
                      <span className="bg-indigo-800/60 px-2 py-1 rounded-md">
                        Time: {match.completionTime}s
                      </span>
                    )}
                  </div>
                  <div className="text-right text-blue-300">
                    {match.endedAt && match.endedAt.seconds && (
                      new Date(match.endedAt.seconds * 1000).toLocaleDateString()
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Exit Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleExit}
          className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition duration-200"
          aria-label="Exit to main menu"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-sm mx-auto">
            {modalType === 'win' ? (
              <>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Congratulations!</h2>
                <p className="text-lg text-gray-800 mb-4">You won the match!</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-red-600 mb-2">Better Luck Next Time!</h2>
                <p className="text-lg text-gray-800 mb-4">You lost the match. Keep practicing!</p>
              </>
            )}
            <button
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <BackgroundSound/>
    </div>
  );
}
