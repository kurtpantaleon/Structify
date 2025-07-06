import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/images/Logo Structify.png';
import fire from '../assets/images/fire.png';
import coin from '../assets/images/coin.png';
import heart from '../assets/images/heart.png';
import heartsImage from '../assets/images/hearts.png';
import profile from '../assets/images/sample profile.png';
import { useGameStats } from '../context/gameStatsContext';
import { AnimatePresence, motion } from 'framer-motion';

function Header() {
  const navigate = useNavigate();
  const [showHeartShop, setShowHeartShop] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const { hearts, coins, rankPoints, updateStats } = useGameStats();
  const [animateHearts, setAnimateHearts] = useState(false);

  const handleProfileClick = () => navigate('/viewProfile');
  
  const handleHeartClick = () => {
    setShowHeartShop((prev) => !prev);
    // Reset quantity when opening modal
    if (!showHeartShop) setQuantity(1);
  };
  
  const handleQuantityChange = (delta) => {
    const newQuantity = Math.min(3 - hearts, Math.max(1, quantity + delta));
    setQuantity(newQuantity);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 2000);
  };

  const handleBuyHearts = async () => {
    const totalCost = quantity;
    const newHeartsTotal = hearts + quantity;
    
    if (newHeartsTotal > 3) {
      showError("You cannot have more than 3 hearts!");
      return;
    }
    
    if (coins >= totalCost) {
      setAnimateHearts(true);
      await updateStats({
        hearts: newHeartsTotal,
        coins: coins - totalCost
      });
      setShowHeartShop(false);
      setQuantity(1);
      setTimeout(() => setAnimateHearts(false), 1000);
    } else {
      showError("Not enough coins!");
    }
  };

  // Close modal when pressing ESC key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showHeartShop) {
        setShowHeartShop(false);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [showHeartShop]);

  return (
    <header style={{ backgroundColor: '#30418B' }} className="flex items-center justify-between px-4 sm:px-6 py-3 shadow-md border-b border-indigo-900/40">
      <div className="flex items-center">
        <img src={Logo} alt="Structify Logo" className="h-9 sm:h-12" />
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 relative">
        {/* Heart Indicator */}
        <div
          onClick={handleHeartClick}
          className={`flex items-center text-white px-2 sm:px-3 py-1 rounded-lg cursor-pointer transition-all duration-200
            bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600
            shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md
            ${animateHearts ? 'animate-pulse' : ''}`}
          title="Hearts - Click to buy more"
        >
          <div className="relative">
            <img src={heart} alt="Heart Icon" className="h-6 w-6 sm:h-7 sm:w-7" />
            {hearts === 0 && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping"></div>
            )}
          </div>
          <span className="ml-1 text-base sm:text-lg font-medium">{hearts}</span>
        </div>
 
        {/* Heart Shop Modal */}
        <AnimatePresence>
          {showHeartShop && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowHeartShop(false);
              }}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-[#4c69b7] to-[#5e7fd9] rounded-2xl shadow-2xl p-6 w-[90%] max-w-[420px] relative"
              >
                {/* Close button */}
                <button 
                  onClick={() => setShowHeartShop(false)} 
                  className="absolute right-4 top-4 bg-white/20 hover:bg-white/30 text-white h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  ×
                </button>

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white drop-shadow-sm">HEART SHOP</h3>
                  <p className="text-blue-100 text-sm mt-1">Restore your hearts to keep learning</p>
                </div>
                
                <div className="flex flex-col items-center bg-indigo-900/30 rounded-xl p-5 backdrop-blur-sm shadow-inner">
                  {/* Hearts display with animation */}
                  <div className="relative mb-4">
                    <img src={heartsImage} alt="Heart Icon" className="h-20" />
                    <div className="absolute top-0 right-0 bg-blue-900/80 text-white text-xs px-2 py-1 rounded-full">
                      {hearts}/3
                    </div>
                  </div>
                  
                  {/* Error message */}
                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-red-500/90 text-white px-4 py-2 rounded-lg mb-4 text-sm font-medium"
                      >
                        {errorMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Quantity selector */}
                  <div className="flex items-center space-x-5 mb-6 bg-indigo-800/40 p-3 rounded-xl w-full justify-center">
                    <button 
                      onClick={() => handleQuantityChange(-1)} 
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center text-2xl font-bold bg-blue-400 hover:bg-blue-500 disabled:bg-blue-300/50 disabled:cursor-not-allowed rounded-full text-white shadow-md transition-colors"
                    >
                      -
                    </button>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-white text-xs mb-1">Quantity</span>
                      <span className="text-2xl font-bold text-white w-6 text-center">{quantity}</span>
                    </div>
                    
                    <button 
                      onClick={() => handleQuantityChange(1)} 
                      disabled={quantity >= (3 - hearts)}
                      className="w-10 h-10 flex items-center justify-center text-2xl font-bold bg-blue-400 hover:bg-blue-500 disabled:bg-blue-300/50 disabled:cursor-not-allowed rounded-full text-white shadow-md transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Buy button */}
                  <button 
                    onClick={handleBuyHearts}
                    disabled={hearts >= 3 || coins < quantity}
                    className={`w-full py-3 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0
                      ${hearts >= 3 ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'}`}
                  >
                    <div className="flex items-center justify-center">
                      <span>Buy {quantity} heart{quantity > 1 ? 's' : ''}</span>
                      <div className="flex items-center ml-2 bg-white/20 px-2 py-0.5 rounded-full">
                        <img src={coin} alt="Coin" className="h-4 w-4 mr-1" />
                        <span className="text-sm">{quantity}</span>
                      </div>
                    </div>
                  </button>
                  
                  {/* Current balance display */}
                  <div className="mt-4 text-blue-100 text-sm flex items-center">
                    Your balance: 
                    <div className="flex items-center ml-2 bg-indigo-700/50 px-2 py-0.5 rounded-full">
                      <img src={coin} alt="Coin" className="h-4 w-4 mr-1" />
                      <span>{coins}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coin Indicator */}
        <div className="flex items-center text-white px-2 sm:px-3 py-1 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 shadow-md">
          <img src={coin} alt="Coin Icon" className="h-6 w-6 sm:h-7 sm:w-7" />
          <span className="ml-1 text-base sm:text-lg font-medium">{coins}</span>
        </div>        {/* Rank Points Indicator */}
        <div className="flex items-center text-white px-2 sm:px-3 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 shadow-md">
          <img src={fire} alt="Fire Icon" className="h-6 w-6 sm:h-7 sm:w-7" />
          <span className="ml-1 text-base sm:text-lg font-medium">{rankPoints}</span>
        </div>
        
        {/* My Progress Button */}
        <button 
          onClick={() => navigate('/my-progress')}
          className="flex items-center text-white px-2 sm:px-3 py-1 rounded-lg bg-gradient-to-r bg-blue-600 shadow-md hover:shadow-lg transition-all"
          title="View My Progress"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="ml-1 text-xs sm:text-sm font-medium hidden sm:inline">Progress</span>
        </button>

        {/* Profile Indicator */}
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gray-200 cursor-pointer border-2 border-white/30 shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
          onClick={handleProfileClick}
          title="View Profile"
        >
          <img src={profile} alt="User Avatar" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}

export default Header;