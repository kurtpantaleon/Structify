import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/images/Logo Structify.png';
import fire from '../assets/images/fire.png';
import coin from '../assets/images/coin.png';
import heart from '../assets/images/heart.png';
import heartsImage from '../assets/images/hearts.png';
import profile from '../assets/images/sample profile.png';
import { useGameStats } from '../context/gameStatsContext';

function Header() {
  const navigate = useNavigate();
  const [showHeartShop, setShowHeartShop] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const { hearts, coins, rankPoints, updateStats } = useGameStats();

  const handleProfileClick = () => navigate('/viewProfile');
  const handleHeartClick = () => setShowHeartShop((prev) => !prev);
  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.min(3, Math.max(1, prev + delta)));
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
      await updateStats({
        hearts: newHeartsTotal,
        coins: coins - totalCost
      });
      setShowHeartShop(false);
      setQuantity(1);
    } else {
      showError("Not enough coins!");
    }
  };

  return (
    <header style={{ backgroundColor: '#30418B' }} className="flex items-center justify-between px-6 py-3 shadow-md border-b-1 border-gray-200">
      <div className="flex items-center">
        <img src={Logo} alt="Structify Logo" className="h-12" />
      </div>

      <div className="flex items-center space-x-3 relative">
        <div
          onClick={handleHeartClick}
          style={{ backgroundColor: '#97BAEC' }}
          className="flex items-center text-white px-3 py-1 rounded-lg cursor-pointer"
        >
          <img src={heart} alt="Heart Icon" className="h-7 w-7" />
          <span className="ml-1 text-lg">{hearts}</span>
        </div>
 
        {showHeartShop && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div style={{ backgroundColor: '#6987D5' }} className="backdrop-blur-lg rounded-2xl shadow-4xl p-6 w-[420px] relative">
              <button 
                onClick={() => setShowHeartShop(false)} 
                className="absolute right-4 top-4 text-white text-3xl font-bold hover:text-gray-200 cursor-pointer"
              >
                ×
              </button>

              <div className="relative mb-6 text-center">
                <h3 className="text-2xl font-bold text-white-600">HEART SHOP</h3>
              </div>
              <div className="flex flex-col items-center">
                <img src={heartsImage} alt="Heart Icon" className="h-20 mb-4" />
                {errorMessage && (
                  <div className="text-red-500 mb-4 font-medium">
                    {errorMessage}
                  </div>
                )}
                <div className="flex items-center space-x-4 mb-4">
                  <button onClick={() => handleQuantityChange(-1)} className="text-2xl px-3 bg-blue-300 rounded">-</button>
                  <span className="text-xl font-bold w-6 text-center">{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} className="text-2xl px-3  bg-blue-300 rounded">+</button>
                </div>
                <button 
                  onClick={handleBuyHearts}
                  className="bg-green-500 text-white rounded px-6 py-2 hover:bg-green-600"
                >
                  Buy {quantity} for {quantity} Coin{quantity > 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: '#97BAEC' }} className="flex items-center text-white px-3 py-1 rounded-lg">
          <img src={coin} alt="Coin Icon" className="h-7 w-7" />
          <span className="ml-1 text-lg">{coins}</span>
        </div>

        <div style={{ backgroundColor: '#97BAEC' }} className="flex items-center text-white px-3 py-1 rounded-lg">
          <img src={fire} alt="Fire Icon" className="h-7 w-7" />
          <span className="ml-1 text-lg">{rankPoints}</span>
        </div>

        <div
          className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 cursor-pointer"
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