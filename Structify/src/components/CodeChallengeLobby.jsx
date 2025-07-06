// filepath: f:\repo\Structify\Structify\src\components\CodeChallengeLobby.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/firebaseConfig';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sword, 
  Award, 
  Clock, 
  Code, 
  User, 
  Shield, 
  AlertOctagon, 
  Loader2, 
  ChevronDown, 
  Trophy, 
  Flame, 
  Zap,
  Target,
  Users,
  Cpu,
  Medal,
  SwordsIcon
} from 'lucide-react';
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
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  
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
  
  // Filter match history based on selected difficulty
  const filteredHistory = difficultyFilter === 'all' 
    ? matchHistory 
    : matchHistory.filter(match => match.difficulty === difficultyFilter);

  // Get available difficulty levels from match history
  const difficultyLevels = [...new Set(matchHistory.map(match => match.difficulty).filter(Boolean))];

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
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold mb-8 bg-clip-text bg-gradient-to-r bg-white">
            Code Arena
          </h1>
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-blue-300 opacity-20"></div>
          </div>
          <p className="mt-4 text-lg">Initializing battle arena...</p>
          <p className="text-sm text-blue-300 mt-2">Connecting to matchmaking servers</p>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-900 via-[#162554] to-[#0c1836] text-white p-4 pt-10 pb-20">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-blue-500 opacity-10 blur-[100px]"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500 opacity-10 blur-[100px]"></div>
        <div className="absolute top-1/3 right-10 w-60 h-60 bg-indigo-500 opacity-5 blur-[80px]"></div>
      </div>
      
      <motion.h1 
        className="text-5xl font-bold mb-8 bg-clip-text bg-gradient-to-r bg-white relative"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <Trophy className="inline-block mr-3 h-8 w-8 text-blue-300" />
        Code Arena
        <Zap className="inline-block ml-3 h-8 w-8 text-purple-400" />
      </motion.h1>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-red-500/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg mb-6 shadow-lg border border-red-400 max-w-lg"
        >
          <div className="flex items-center">
            <AlertOctagon className="h-6 w-6 mr-2 flex-shrink-0" />
            <p className="text-white">{error}</p>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto bg-red-600/50 hover:bg-red-600 rounded-full p-1"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}

      <motion.div 
        className="mb-6 bg-indigo-900/70 backdrop-blur-sm px-5 py-3 rounded-full shadow-inner border border-indigo-700"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center space-x-4">
          <span className={`inline-block w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500 animate-pulse shadow-glow-green' :
            connectionStatus === 'error' ? 'bg-red-500' :
            'bg-yellow-500'
          }`}></span>
          <span className="font-medium">
            {connectionStatus === 'connected' ? 'Battle Network Online' : 
             connectionStatus === 'error' ? 'Connection Error' : 
             'Connecting...'}
          </span>

          {userStats && (
            <>
              <div className="h-4 w-px bg-indigo-600"></div>
              <div className="flex items-center">
                <Cpu className="h-4 w-4 mr-1.5 text-blue-300" />
                <span className="font-medium text-blue-200">{userStats.name}</span>
              </div>
              <div className="h-4 w-px bg-indigo-600"></div>
              <div className="flex items-center">
                <Medal className="h-4 w-4 mr-1.5 text-yellow-300" />
                <span className="font-medium">{userStats.rank}</span>
              </div>
            </>
          )}
        </div>
      </motion.div>
        
      <div className="mb-8 animate-fadeIn"></div>
      
      {/* Search Modal with enhanced animation */}
      <AnimatePresence>
        {isSearching && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="text-center bg-gradient-to-b from-blue-900/90 to-indigo-900/90 p-8 rounded-xl border border-blue-500/50 shadow-lg min-w-[320px] max-w-md"
            >
              <div className="relative mx-auto h-24 w-24 flex items-center justify-center mb-2">
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 animate-spin"></div>
                <div className="absolute inset-0 rounded-full border-2 border-blue-300/30"></div>
                <Target className="h-10 w-10 text-blue-300" />
              </div>
              
              <h3 className="text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
                Seeking Opponents
              </h3>
              
              <p className="mt-3 text-blue-200">Locating an opponent worthy of your skill level...</p>
              
              <div className="mt-4 bg-blue-800/40 rounded-lg py-2 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-300 mr-2" />
                <span className="font-mono text-xl">{formatTime(searchTime)}</span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelSearch}
                className="mt-6 px-6 py-3 bg-red-600/80 hover:bg-red-600 rounded-lg text-white font-medium transition duration-200 w-full flex items-center justify-center"
              >
                <X className="h-5 w-5 mr-2" />
                Cancel Search
              </motion.button>
              
              <p className="text-xs text-blue-300/70 mt-4">
                Estimated wait time: 30-60 seconds
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        className="bg-gradient-to-b from-[#1e2a6b] to-[#17225a] rounded-2xl shadow-xl p-8 w-full max-w-2xl space-y-6 border-l-4 border-r-4 border-t-4 border-b-8 border-blue-800/80 animate-fadeIn relative overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Decorative light beams in the background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 -left-10 w-40 h-80 bg-blue-500/10 rotate-45 blur-2xl transform -translate-y-20"></div>
          <div className="absolute bottom-0 -right-10 w-40 h-60 bg-purple-500/10 -rotate-45 blur-2xl transform translate-y-20"></div>
        </div>
        
        <h2 className="text-2xl font-bold text-center relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Users className="w-8 h-8 text-white" />
          </div>
          Battle Station
        </h2>
        
        <div 
          className="flex justify-between items-center border-4 border-blue-500/70 h-60 rounded-2xl overflow-hidden bg-cover bg-no-repeat bg-center shadow-lg relative"
          style={{ backgroundImage: `url(${select})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-blue-900/40 to-transparent"></div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex flex-col items-center justify-center w-1/2 p-4 space-y-3 relative z-10"
          >
            {/* User Profile with improved styling */}
            <div className="relative">
              <img 
                src={userStats?.avatar || profile} 
                alt={`${userStats?.name || 'User'} avatar`} 
                className="w-20 h-20 rounded-full border-4 border-white shadow-xl" 
              />
              <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1 border-2 border-white">
                <Cpu className="h-4 w-4 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold text-white drop-shadow-md">{userStats?.name || 'Loading...'}</span>
            {userStats && (
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1 text-sm bg-blue-700/60 px-3 py-1 rounded-full">
                  <Flame className="h-4 w-4 text-yellow-300 mr-1" />
                  <span className="font-semibold">{userStats.rank}</span>
                  <span className="text-blue-200">rating</span>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-xs px-3 py-1 bg-indigo-800/80 rounded-full text-white border border-indigo-500/40">
                    {userStats.skillLevel || 'beginner'}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
          
          <div className="w-px h-32 bg-blue-400/30"></div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex flex-col items-center justify-center w-1/2 p-4 space-y-3 relative z-10"
            aria-label="Select Opponent"
          >
            <div className="rounded-full w-20 h-20 bg-blue-800/80 shadow-xl flex items-center justify-center border-4 border-blue-400/80 relative overflow-hidden">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }}
              >
                <img 
                  src={icon} 
                  alt="Select opponent" 
                  className="w-16 h-16 object-cover"
                />
              </motion.div>
              <div className="absolute inset-0 bg-blue-500/20 animate-pulse"></div>
            </div>
            <span className="text-xl font-bold text-white drop-shadow-md">Find Opponents</span>
            <p className="text-xs text-blue-200 max-w-[180px] text-center">
              Match with a Opponents of similar rank and prove your coding mastery!
            </p>
          </motion.div>
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
                : 'hover:shadow-blue-600/70 hover:brightness-110'
            } group relative overflow-hidden`}
            style={{
              backgroundImage: `url(${ButtonBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <motion.div 
              className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"
              animate={{ opacity: [0, 0.1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            ></motion.div>
            
            {isSearching ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <SwordsIcon className="h-5 w-5 mr-2" />
            )}
            
            {isSearching ? 'Matchmaking...' : 'Find Match'}
          </motion.button>
        </div>
        
        {connectionStatus !== 'connected' && (
          <div className="text-center text-sm text-blue-300/70">
            {connectionStatus === 'connecting' ? 'Connecting to servers...' : 'Connection error. Please wait...'}
          </div>
        )}
      </motion.div>
       
      <motion.div 
        className="bg-gradient-to-b from-[#1e2a6b] to-[#17225a] rounded-2xl shadow-xl p-6 w-full max-w-2xl space-y-4 border-l-4 border-r-4 border-t-4 border-b-8 border-blue-800/80 mt-6 animate-fadeIn relative overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* Background design elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full">
            <Code className="w-40 h-40 text-white/5" />
          </div>
        </div>
        
        <motion.div 
          className="flex flex-col items-center mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button 
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center justify-center">
              <div className="h-1 w-16 bg-blue-400/70 rounded-full mr-4"></div>
              <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">Combat History</h2>
              <div className="h-1 w-16 bg-blue-400/70 rounded-full ml-4"></div>
            </div>
            
            <ChevronDown 
              className={`w-5 h-5 text-blue-300 transform transition-transform ${historyExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          
          {userStats && historyExpanded && (
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              <div className="bg-blue-900/70 px-4 py-2 rounded-full border border-blue-600/50 flex items-center">
                <div className="flex items-center">
                  <span className="font-bold text-green-400 mr-1">{userStats.wins}</span>
                  <span className="text-sm text-green-300 mr-1">Wins</span>
                </div>
                {userStats.losses > 0 && (
                  <>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="font-bold text-red-400 mr-1">{userStats.losses}</span>
                    <span className="text-sm text-red-300">Losses</span>
                  </>
                )}
                {userStats.wins > 0 && userStats.losses > 0 && (
                  <>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="font-bold text-blue-300 mr-1">
                      {Math.round((userStats.wins / (userStats.wins + userStats.losses)) * 100)}%
                    </span>
                  </>
                )}
              </div>
              
              {difficultyLevels.length > 0 && (
                <div className="bg-indigo-900/60 rounded-full flex items-center h-8 pl-3 pr-1">
                  <span className="text-xs text-blue-200 mr-2">Filter:</span>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="bg-transparent text-blue-100 text-sm border-none focus:ring-0 cursor-pointer"
                  >
                    <option value="all">All levels</option>
                    {difficultyLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </motion.div>
        
        {/* Match history with animation */}
        <AnimatePresence>
          {historyExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-blue-300">
                  <Trophy className="h-10 w-10 mx-auto text-blue-400/50 mb-3" />
                  <p className="text-lg">No battle records found</p>
                  <p className="text-sm mt-2 text-blue-300/70">Enter the arena to build your legacy!</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFindMatch}
                    disabled={isSearching || connectionStatus !== 'connected'}
                    className="mt-4 px-6 py-2 bg-blue-700/60 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
                  >
                    Find Match
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4 mt-2">
                  {filteredHistory.map((match, idx) => {
                    const userIsWinner = match.winnerUid === user?.uid;
                    const opponent = match.isPlayer1 ? match.player2 : match.player1;
                    const opponentIsWinner = match.winnerUid === opponent?.uid && opponent?.uid !== 'unknown';
                    
                    const userLabel = userIsWinner ? 'Winner' : 'Loser';
                    const opponentLabel = opponentIsWinner ? 'Winner' : 'Loser';

                    const leftPlayer = userIsWinner ? userStats : opponent;
                    const rightPlayer = userIsWinner ? opponent : userStats;
                    const leftLabel = userIsWinner ? userLabel : opponentLabel;
                    const rightLabel = userIsWinner ? opponentLabel : userLabel;

                    return (
                      <motion.div
                        key={match.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                        className="relative border-2 border-blue-600/50 rounded-xl p-4 bg-cover bg-center shadow-md overflow-hidden"
                        style={{ backgroundImage: `url(${HistoryBg})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 rounded-xl"></div>
                        
                        {/* Match outcome badge */}
                        {userIsWinner ? (
                          <div className="absolute top-2 right-2 bg-green-600/90 text-white text-xs px-2 py-1 rounded-md flex items-center z-10">
                            <Trophy className="w-3 h-3 mr-1" /> Triumph
                          </div>
                        ) : (
                          <div className="absolute top-2 right-2 bg-red-600/90 text-white text-xs px-2 py-1 rounded-md flex items-center z-10">
                            <Shield className="w-3 h-3 mr-1" /> Defeated
                          </div>
                        )}
                        
                        <div className="relative z-10 flex justify-between items-center">
                          {/* Left Player */}
                          <div className="flex flex-col items-center">
                            <div className="relative">
                              <img 
                                src={leftPlayer?.avatar || profile} 
                                alt={leftPlayer?.name} 
                                className="w-12 h-12 rounded-full border-2 border-white shadow-lg" 
                              />
                              {leftLabel === 'Winner' && (
                                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                                  <Award className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <span className="font-bold text-lg mt-1">{leftPlayer?.name}</span>
                            <div className="flex items-center mt-1 bg-blue-800/40 px-2 py-0.5 rounded-md">
                              <img src={fireIcon} alt="rank" className="w-4 h-4 mr-1" />
                              <span className="font-semibold text-white text-sm">{leftPlayer?.rank}</span>
                            </div>
                            <span className={`text-sm font-medium mt-1 ${leftLabel === 'Winner' ? 'text-green-400' : 'text-red-400'}`}>
                              {leftLabel}
                            </span>
                            {leftLabel === 'Winner' && (
                              <div className="flex items-center mt-1 bg-green-600/40 px-2 py-0.5 rounded-md">
                                <img src={fireIcon} alt="rank points" className="w-3 h-3 mr-1" />
                                <span className="text-xs text-green-300">+50 rank points</span>
                              </div>
                            )}
                          </div>
                          
                          {/* VS */}
                          <div className="px-4 py-2 bg-gradient-to-b from-blue-800/70 to-indigo-900/70 rounded-full border border-blue-500/40 text-xl font-bold text-white mx-3 shadow-inner">
                            VS
                          </div>
                          
                          {/* Right Player */}
                          <div className="flex flex-col items-center">
                            <div className="relative">
                              <img 
                                src={rightPlayer?.avatar || profile} 
                                alt={rightPlayer?.name} 
                                className="w-12 h-12 rounded-full border-2 border-white shadow-lg" 
                              />
                              {rightLabel === 'Winner' && (
                                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                                  <Award className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <span className="font-bold text-lg mt-1">{rightPlayer?.name}</span>
                            <div className="flex items-center mt-1 bg-blue-800/40 px-2 py-0.5 rounded-md">
                              <img src={fireIcon} alt="rank" className="w-4 h-4 mr-1" />
                              <span className="font-semibold text-white text-sm">{rightPlayer?.rank || ''}</span>
                            </div>
                            <span className={`text-sm font-medium mt-1 ${rightLabel === 'Winner' ? 'text-green-400' : 'text-red-400'}`}>
                              {rightLabel}
                            </span>
                            {rightLabel === 'Winner' && (
                              <div className="flex items-center mt-1 bg-green-600/40 px-2 py-0.5 rounded-md">
                                <img src={fireIcon} alt="rank points" className="w-3 h-3 mr-1" />
                                <span className="text-xs text-green-300">+50 rank points</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 flex justify-between items-center text-xs">
                          <div className="flex flex-wrap gap-2 text-left text-blue-200">
                            {match.difficulty && (
                              <span className="bg-indigo-800/70 px-2 py-1 rounded-md flex items-center">
                                <Code className="h-3 w-3 mr-1" />
                                {match.difficulty}
                              </span>
                            )}
                            {match.completionTime && (
                              <span className="bg-blue-800/70 px-2 py-1 rounded-md flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {match.completionTime}s
                              </span>
                            )}
                          </div>
                          <div className="text-right text-blue-200 bg-blue-900/50 px-2 py-1 rounded-md">
                            {match.endedAt && match.endedAt.seconds && (
                              new Date(match.endedAt.seconds * 1000).toLocaleDateString()
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Exit Button */}
      <motion.div 
        className="fixed top-4 right-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          onClick={handleExit}
          whileHover={{ scale: 1.1, backgroundColor: "rgb(220, 38, 38)" }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition duration-200 shadow-md"
          aria-label="Exit to main menu"
        >
          <X className="w-6 h-6 text-white" />
        </motion.button>
      </motion.div>

      {/* Redesigned result modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={`rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-auto border-4 ${
                modalType === 'win' ? 'bg-gradient-to-b from-green-800 to-green-900 border-green-500' : 
                'bg-gradient-to-b from-red-800 to-red-900 border-red-500'
              }`}
            >
              {modalType === 'win' ? (
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{ duration: 1 }}
                >
                  <div className="w-24 h-24 mx-auto bg-green-500/30 rounded-full flex items-center justify-center mb-4 border-4 border-green-400">
                    <Trophy className="h-12 w-12 text-yellow-300" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Glorious Victory!</h2>
                  <p className="text-lg text-green-200 mb-4">You've conquered this coding challenge!</p>
                  <div className="bg-green-700/50 rounded-lg p-4 mb-4 text-left">
                    <p className="text-green-200">
                      Masterful performance! Your coding prowess has earned you increased rank and glory.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <>
                  <div className="w-24 h-24 mx-auto bg-red-500/30 rounded-full flex items-center justify-center mb-4 border-4 border-red-400">
                    <Shield className="h-12 w-12 text-red-200" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Battle Lost</h2>
                  <p className="text-lg text-red-200 mb-4">The challenge proved too difficult</p>
                  <div className="bg-red-700/50 rounded-lg p-4 mb-4 text-left">
                    <p className="text-red-200">
                      Even great warriors face defeat. Analyze your approach and return stronger to the arena!
                    </p>
                  </div>
                </>
              )}
              
              <div className="flex space-x-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center"
                  onClick={handleFindMatch}
                  disabled={isSearching || connectionStatus !== 'connected'}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Battle Again
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BackgroundSound/>
    </div>
  );
}
