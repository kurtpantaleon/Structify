import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContextProvider';
import { Swords, Clock, Award } from 'lucide-react';
import '../../App.css'; // Import the main CSS file

export default function Match() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const { currentUser } = auth;
  const { matchId, opponent } = location.state || {};
  const [timeLeft, setTimeLeft] = useState(5);
  
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
  
  useEffect(() => {
    if (!matchId || !opponent) {
      navigate('/CodeChallengeLobby');
      return;
    }

    // Countdown timer before starting the game
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // TODO: Navigate to the actual game component
          // For now, just go back to lobby
          navigate('/CodeChallengeLobby');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchId, opponent, navigate]);
  
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0b1444] to-[#1a1f60] text-white p-4">
      <div className="bg-[#1e2a6b] rounded-2xl shadow-xl p-8 w-full max-w-2xl space-y-6 border-4 border-blue-800">
        <div className="flex items-center justify-center gap-3 mb-8">
          <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">Match Found!</h1>
          <Award className="w-8 h-8 text-yellow-300" />
        </div>
        
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

        <div className="text-xl text-center py-4 bg-blue-900/20 rounded-lg border border-blue-500/30 flex items-center justify-center">
          <Clock className="w-5 h-5 mr-2 text-blue-300 animate-pulse" />
          Game starting in <span className="font-bold text-2xl mx-2 text-yellow-300">{timeLeft}</span> seconds...
        </div>
      </div>
    </div>
  );
}
