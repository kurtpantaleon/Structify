import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/images/Logo Structify.png';
import fire from '../assets/images/fire.png';
import coin from '../assets/images/coin.png';
import heart from '../assets/images/heart.png';
import profile from '../assets/images/sample profile.png';
import hearts from '../assets/images/hearts.png';


function Header() {
  const navigate = useNavigate();
  const [showHeartShop, setShowHeartShop] = useState(false);

  const handleProfileClick = () => navigate('/viewProfile');
  const handleHeartClick = () => setShowHeartShop((prev) => !prev);

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
          <span className="ml-1 text-lg">3</span>
        </div>

        {showHeartShop && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div  style={{ backgroundColor: '#6987D5' }} className="backdrop-blur-sm rounded-xl  shadow-xl p-6 w-[550px] h-150">
              <div className="relative mb-4 text-center">
                <h3 className="text-2xl font-bold text-white-600">HEART SHOP</h3>
                <button onClick={() => setShowHeartShop(false)} className="absolute right-0 top-0 text-gray-600 text-2xl font-bold">&times;</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div   style={{ backgroundColor: '#30418B' }} className=" rounded-xl p-4 flex flex-col items-center justify-between shadow">
                  <img src={hearts} alt="heart pack" className="h-12 mb-2" />
                  <p className="text-xl font-bold">5 HEARTS</p>
                  <button className="bg-green-500 text-white rounded mt-2 px-4 py-1 hover:bg-green-600">50 coins</button>
                </div>
                <div  style={{ backgroundColor: '#30418B' }} className="rounded-xl p-4 flex flex-col items-center justify-between shadow">
                  <img src={hearts} alt="heart pack" className="h-12 mb-2" />
                  <p className="text-xl font-bold">10 HEARTS</p>
                  <button className="bg-green-500 text-white rounded mt-2 px-4 py-1 hover:bg-green-600">100 coins</button>
                </div>
                <div  style={{ backgroundColor: '#30418B' }} className=" rounded-xl p-4 flex flex-col items-center justify-between shadow relative">
                  <img src={hearts} alt="heart pack" className="h-12 mb-2" />
                  <p className="text-xl font-bold">15 HEARTS</p>
                  <button className="bg-green-500 text-white rounded mt-2 px-4 py-1 hover:bg-green-600">150 coins</button>
                </div>
                <div  style={{ backgroundColor: '#30418B' }} className=" rounded-xl p-4 flex flex-col items-center justify-between shadow relative">
                  <img src={hearts} alt="heart pack" className="h-12 mb-2" />
                  <p className="text-xl font-bold">20 HEARTS</p>
                  <button className="bg-green-500 text-white rounded mt-2 px-4 py-1 hover:bg-green-600">250 coins</button>
                </div>
                <div  style={{ backgroundColor: '#30418B' }} className="rounded-xl p-4 flex flex-col items-center justify-between shadow relative">
                  <img src={hearts} alt="heart pack" className="h-12 mb-2" />
                  <p className="text-xl font-bold">30 HEARTS</p>
                  <button className="bg-green-500 text-white rounded mt-2 px-4 py-1 hover:bg-green-600">290 coins</button>
                </div>
                <div  style={{ backgroundColor: '#30418B' }} className="rounded-xl p-4 flex flex-col items-center justify-between shadow relative">
                  <img src={hearts} alt="heart pack" className="h-12 mb-2" />
                  <p className="text-xl font-bold">40 HEARTS</p>
                  <button className="bg-green-500 text-white rounded mt-2 px-4 py-1 hover:bg-green-600">300 coins</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: '#97BAEC' }} className="flex items-center text-white px-3 py-1 rounded-lg">
          <img src={coin} alt="Coin Icon" className="h-7 w-7" />
          <span className="ml-1 text-lg">100</span>
        </div>

        <div style={{ backgroundColor: '#97BAEC' }} className="flex items-center text-white px-3 py-1 rounded-lg">
          <img src={fire} alt="Fire Icon" className="h-7 w-7" />
          <span className="ml-1 text-lg">1000</span>
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