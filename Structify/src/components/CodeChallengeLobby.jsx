import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import select from '../assets/images/select.png';
import profile from '../assets/images/sample profile.png';
import icon from '../assets/images/select-icon.png';
import ButtonBg from '../assets/images/ButtonBg.png';
import HistoryBg from '../assets/images/challngeBg.png';
import fireIcon from '../assets/images/fire.png';
import { X } from 'lucide-react';

const styles = {
  challengeButton: "w-90 py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-x-2 shadow-lg shadow-blue-600/40 hover:shadow-blue-600/70 transition duration-300 ease-in-out hover:scale-105 bg-no-repeat"
};

const historyMatches = [
  {
    player1: { name: 'Bretana', avatar: profile, rank: 990 },
    player2: { name: 'Pantaleon', avatar: profile, rank: 122 }
  },
  {
    player1: { name: 'Astra', avatar: profile, rank: 512 },
    player2: { name: 'Nova', avatar: profile, rank: 680 }
  },
  {
    player1: { name: 'Astra', avatar: profile, rank: 512 },
    player2: { name: 'Nova', avatar: profile, rank: 680 }
  },
  {
    player1: { name: 'Astra', avatar: profile, rank: 512 },
    player2: { name: 'Nova', avatar: profile, rank: 680 }
  },
  {
    player1: { name: 'Astra', avatar: profile, rank: 512 },
    player2: { name: 'Nova', avatar: profile, rank: 680 }
  },
  {
    player1: { name: 'Astra', avatar: profile, rank: 512 },
    player2: { name: 'Nova', avatar: profile, rank: 680 }
  }
];

export default function CodeChallengeLobby() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0b1444] to-[#1a1f60] text-white p-4 space-y-10 relative">
      <button
        className="absolute top-4 right-4 bg-gradient-to-tr from-red-600 to-yellow-500 p-2 rounded-full shadow-xl hover:scale-110 transform transition duration-300 border-2 border-white"
        aria-label="Close"
        onClick={() => navigate('/')}
      >
        <X className="text-white w-6 h-6" />
      </button>

      <motion.h1 
        initial={{ opacity: 0, y: -30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="text-5xl font-extrabold tracking-widest uppercase text-center drop-shadow-md"
      >
        Code Challenge
      </motion.h1>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-[#1e2a6b] rounded-2xl shadow-xl p-8 w-full max-w-2xl space-y-6 border-4 border-blue-800"
      >
        <h2 className="text-2xl font-semibold text-center">Select an opponent to test your might</h2>
        <div 
          className="flex justify-between items-center border-4 border-blue-500 h-50 rounded-2xl overflow-hidden bg-cover bg-no-repeat bg-center" 
          style={{ backgroundImage: `url(${select})` }}
        >
          <div className="flex flex-col items-center justify-center w-1/2 p-4 space-y-3">
            <img src={profile} alt="Bretana avatar" className="w-20 h-20 rounded-full border-4 border-white" />
            <span className="text-xl font-bold">Bretana</span>
          </div>
          <button 
            className="w-1/2 flex flex-col items-center justify-center p-4 space-y-3 cursor-pointer"
            aria-label="Select Opponent"
          >
            <div 
              className="rounded-full w-20 h-20 bg-white shadow-lg flex items-center justify-center"
              style={{ backgroundImage: `url(${icon})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
            <span className="text-xl font-bold">Select Opponent</span>
          </button>
        </div>
        <div className="flex justify-center items-center p-3 mt-2">
          <button
            className={styles.challengeButton}
            style={{
              backgroundImage: `url(${ButtonBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            Find Match
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-[#1e2a6b] rounded-2xl shadow-xl p-8 w-full max-w-2xl space-y-4 border-4 border-blue-800"
      >
        <h2 className="text-2xl font-semibold text-center">History</h2>
        {historyMatches.map((match, idx) => (
          <div
            key={idx}
            className="relative border-2 border-blue-600 rounded-xl p-4 bg-cover bg-center shadow-md overflow-hidden"
            style={{ backgroundImage: `url(${HistoryBg})` }}
          >
            <div className="absolute inset-0  bg-opacity-50 rounded-xl"></div>
            <div className="relative z-10 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img src={match.player1.avatar} alt={match.player1.name} className="w-10 h-10 rounded-full border-2 border-white" />
                <span className="font-bold text-lg">{match.player1.name}</span>
                <div className="flex items-center space-x-1 text-lg text-white-400">
                  <img src={fireIcon} alt="rank" className="w-10 h-10" />
                  <span>{match.player1.rank}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 text-lg text-white-400">
                  <span>{match.player2.rank}</span>
                  <img src={fireIcon} alt="rank" className="w-10 h-10" />
                </div>
                <span className="font-bold text-lg">{match.player2.name}</span>
                <img src={match.player2.avatar} alt={match.player2.name} className="w-10 h-10 rounded-full border-2 border-white" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
