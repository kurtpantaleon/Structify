import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContextProvider';
import { Swords, Clock, Award, Code, Zap, Brain, Trophy, AlertTriangle } from 'lucide-react';
import '../../App.css'; // Import the main CSS file
import CodingChallenge from './CodingChallenge';
import { getSocket, reconnectSocket } from '../../services/socketService';
import { initTestingModule } from '../../utils/challengeSync';

// Initialize challenge testing module for development
if (process.env.NODE_ENV !== 'production') {
  // Make testing functions available in browser console
  setTimeout(() => {
    initTestingModule();
    console.log('🧪 Challenge testing module initialized. Use window.ChallengeTest.testSync() to test sync.');
  }, 1000);
}

export default function Match() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const { currentUser } = auth;
  const { matchId, opponent } = location.state || {};
  const [timeLeft, setTimeLeft] = useState(5);
  const [showChallenge, setShowChallenge] = useState(false);
  const [opponentQuit, setOpponentQuit] = useState(false);
  
  // Ensure socket connection is established when component mounts
  useEffect(() => {
    // Make sure socket is connected
    reconnectSocket();
  }, []);
  
  // Debug logging
  console.log("Auth context:", auth);
  console.log("Current user:", currentUser);
  console.log("Location state:", location.state);
  
  // Redirect if we arrived at this page without proper state
  useEffect(() => {
    if (!location.state) {
      console.error("Match page accessed without proper state data");
      navigate('/CodeChallengeLobby');
    }
  }, [location.state, navigate]);
  // Listen for opponent disconnection events
  useEffect(() => {
    if (!matchId || !opponent) return;
    
    // Get the socket instance
    const socket = getSocket();

    const handleOpponentQuit = (data) => {
      if (data.matchId === matchId || data.userId === opponent.userId) {
        console.log('Opponent quit during countdown!');
        setOpponentQuit(true);
        // Wait 3 seconds then redirect to lobby
        setTimeout(() => {
          navigate('/CodeChallengeLobby', { 
            state: { 
              message: 'Your opponent left the match! You win by default.',
              win: true
            }
          });
        }, 3000);
      }
    };

    socket.on('opponentQuit', handleOpponentQuit);

    return () => {
      socket.off('opponentQuit', handleOpponentQuit);
    };
  }, [matchId, opponent, navigate]);  useEffect(() => {
    if (!matchId || !opponent) {
      navigate('/CodeChallengeLobby');
      return;
    }

    // Countdown timer before starting the game
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Show the coding challenge when countdown ends
          setShowChallenge(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchId, opponent, navigate]);
  
  useEffect(() => {
    const socket = getSocket();
    const handleMatchEnded = (data) => {
      navigate('/CodeChallengeLobby', { state: { winnerUid: data.winnerUid } });
    };
    socket.on('matchEnded', handleMatchEnded);
    return () => socket.off('matchEnded', handleMatchEnded);
  }, [navigate]);
  
  // If there's no match ID or opponent data, show a loading state
  if (!matchId || !opponent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0b1444] to-[#1a1f60] text-white p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-lg">Redirecting to lobby...</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0b1444] to-[#1a1f60] text-white p-4">      {!showChallenge ? (
        <div className="bg-[#1e2a6b] rounded-2xl shadow-xl p-8 w-full max-w-2xl space-y-6 border-4 border-blue-800">
          {opponentQuit ? (
            <div className="bg-green-900/30 border-2 border-green-700 rounded-xl p-4 mb-6 animate-pulse">
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
                <div>
                  <h2 className="text-xl font-bold text-green-300">Your opponent left!</h2>
                  <p className="text-white">You win by default. Returning to lobby...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 mb-8">
              <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">Match Found!</h1>
              <Award className="w-8 h-8 text-yellow-300" />
            </div>
          )}
          
          <div className="flex justify-between items-center mb-8">
            <div className="text-center">
              <div className="relative inline-block">
                <img 
                  src={currentUser?.photoURL || "https://via.placeholder.com/100"} 
                  alt="Your avatar" 
                  className="w-24 h-24 rounded-full border-4 border-blue-400 mb-2 shadow-lg shadow-blue-500/50"
                />
                <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 shadow-lg">
                  <Award className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="font-bold text-lg">{currentUser?.name || 'You'}</p>
            </div>
            
            <div className="flex items-center justify-center bg-blue-900/50 rounded-full p-3 border-2 border-blue-500/30">
              <Swords className="w-8 h-8 text-red-400 mr-2" />
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-yellow-200">VS</div>
            </div>
            
            <div className="text-center">
              <div className="relative inline-block">
                <img 
                  src={opponent?.avatar} 
                  alt="Opponent avatar" 
                  className="w-24 h-24 rounded-full border-4 border-red-400 mb-2 shadow-lg shadow-red-500/50"
                />
                <div className="absolute -bottom-2 -right-2 bg-red-500 rounded-full p-2 shadow-lg">
                  <Award className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="font-bold text-lg">{opponent?.name}</p>
            </div>
          </div>

          <div className="text-xl text-center py-4 bg-blue-900/20 rounded-lg border border-blue-500/30 flex flex-col items-center justify-center">
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 mr-2 text-blue-300 animate-pulse" />
              Coding battle begins in <span className="font-bold text-2xl mx-2 text-yellow-300">{timeLeft}</span> seconds...
            </div>
            <div className="flex items-center text-sm text-blue-300">
              <Brain className="w-4 h-4 mr-2" />
              <span>Prepare to solve a coding challenge faster than your opponent!</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 p-3 bg-blue-800/20 rounded-lg animate-pulse">
            <Code className="text-blue-400" />
            <span className="text-blue-300 font-medium">Loading coding challenge...</span>
            <Zap className="text-yellow-400" />
          </div>
        </div>      ) : (        <div className="w-full h-[calc(100vh-2rem)] bg-[#1e2a6b] rounded-lg shadow-xl overflow-hidden border-4 border-blue-800">
          <CodingChallenge 
            matchId={matchId} 
            opponent={opponent}
            currentUser={currentUser}
            difficulty={location.state?.difficulty || 'Easy'}
            onCompleteChallenge={(success, reason, challengeData, completionTime) => {
              // Handle challenge completion, e.g., update user stats
              console.log('Challenge completed!', {success, reason, completionTime});              // Import the stats tracking utility
              import('../../utils/challengeStats.js').then(module => {
                const { updateUserStats, recordMatchResult } = module;
                
                if (currentUser?.uid) {
                  updateUserStats(
                    currentUser.uid,
                    success,
                    matchId,
                    challengeData,
                    opponent?.userId || 'unknown',
                    completionTime,
                    reason
                  );
                  
                  // Record the match result globally
                  recordMatchResult(matchId, {
                    player1: currentUser.uid,
                    player2: opponent?.userId || 'unknown',
                    winner: success ? currentUser.uid : (opponent?.userId || 'unknown'),
                    challengeId: challengeData?.id,
                    difficulty: challengeData?.difficulty,
                    completionTime,
                    completionReason: reason
                  });
                }
              });
            }}            onTimeUp={(challenge, completionTime) => {
              console.log('Time up!', { challenge, completionTime });
              // Import the stats tracking utility
              import('../../utils/challengeStats.js').then(module => {
                const { updateUserStats } = module;
                
                if (currentUser?.uid && challenge) {
                  // Update user stats with a loss due to timeout
                  updateUserStats(
                    currentUser.uid,
                    false,  // Not a winner
                    matchId,
                    challenge,
                    opponent?.userId || 'unknown',
                    completionTime,
                    'time_up'
                  );
                }
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
