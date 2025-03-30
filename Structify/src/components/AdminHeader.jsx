import React from 'react'
import Logo from '../assets/images/Logo Structify.png'
import profile from '../assets/images/sample profile.png'

function Header() {
  return (
    <header style={{ backgroundColor: '#30418B' }} className="flex items-center justify-between px-6 py-3 shadow-md border-b-1 border-gray-200">
    {/* Logo Section */}
    <div className="flex items-center">
      <img src={Logo} alt="Structify Logo" className="h-12" />
    </div>

    <div className="flex items-center space-x-3">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
        <img src={profile} alt="User Avatar" className="w-full h-full object-cover" />
      </div>
    </div>
  </header>
  ) 
}

export default Header