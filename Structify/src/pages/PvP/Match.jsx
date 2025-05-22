import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

export default function Match() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { matchId, opponent } = location.state || {};
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (!matchId || !opponent) {
      navigate('/code-challenge');
      return;
    }

    // Countdown timer before starting the game
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // TODO: Navigate to the actual game component
          // For now, just go back to lobby
          navigate('/code-challenge');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchId, opponent, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0b1444] to-[#1a1f60] text-white p-4">
      <div className="bg-[#1e2a6b] rounded-2xl shadow-xl p-8 w-full max-w-2xl space-y-6 border-4 border-blue-800">
        <h1 className="text-3xl font-bold text-center mb-8">Match Found!</h1>
        
        <div className="flex justify-between items-center mb-8">
          <div className="text-center">
            <img 
              src={user?.photoURL} 
              alt="Your avatar" 
              className="w-24 h-24 rounded-full border-4 border-white mb-2"
            />
            <p className="font-bold">{user?.name || 'You'}</p>
          </div>
          
          <div className="text-4xl font-bold">VS</div>
          
          <div className="text-center">
            <img 
              src={opponent?.avatar} 
              alt="Opponent avatar" 
              className="w-24 h-24 rounded-full border-4 border-white mb-2"
            />
            <p className="font-bold">{opponent?.name}</p>
          </div>
        </div>

        <p className="text-xl text-center">
          Game starting in <span className="font-bold">{timeLeft}</span> seconds...
        </p>
      </div>
    </div>
  );
}
