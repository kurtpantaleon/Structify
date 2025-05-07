import React from 'react';
import Logo from '../assets/images/Logo Structify.png';

function ProfileHeader() {
  

  

  return (
    <header
      style={{ backgroundColor: '#30418B' }}
      className="flex items-center justify-between px-6 py-3 shadow-md border-b-1 border-gray-200"
    >
      {/* Logo Section */}
      <div className="flex items-center">
        <img src={Logo} alt="Structify Logo" className="h-12" />
      </div>

      
    </header>
  );
}

export default ProfileHeader;
