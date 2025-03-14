import React from 'react'
import Logo from '../assets/images/Logo Structify.png'
import fire from '../assets/images/fire.png'
import coin from '../assets/images/coin.png'
import heart from '../assets/images/heart.png'
import profile from '../assets/images/sample profile.png'

function Header() {
  return (
    <header style={{ backgroundColor: '#30418B' }} className="flex items-center justify-between px-6 py-3 shadow-md">
    {/* Logo Section */}
    <div className="flex items-center">
      <img src={Logo} alt="Structify Logo" className="h-12" />
    </div>

    {/* Stats Section */}
    <div className="flex items-center space-x-3">
     {/* Heart Icon */}
     <div style={{ backgroundColor: '#97BAEC' }} className="flex items-center text-white px-3 py-1 rounded-lg">
      <img src={heart} alt="Heart Icon" className="h-7 w-7" />
        <span className="ml-1 text-lg">3</span>
      </div>

      {/* Coin Icon */}
      <div style={{ backgroundColor: '#97BAEC' }} className="flex items-center text-white px-3 py-1 rounded-lg">
        <img src={coin} alt="Coin Icon" className="h-7 w-7" />
        <span className="ml-1 text-lg">100</span>
      </div>

      {/* Fire Icon */}
      <div style={{ backgroundColor: '#97BAEC' }} className="flex items-center text-white px-3 py-1 rounded-lg">
        <img src={fire} alt="Fire Icon" className="h-7 w-7" />
        <span className="ml-1 text-lg">1000</span>
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
        <img src={profile} alt="User Avatar" className="w-full h-full object-cover" />
      </div>
    </div>
  </header>
  ) 
}

export default Header