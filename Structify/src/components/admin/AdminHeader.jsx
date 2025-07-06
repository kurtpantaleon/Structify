import React from 'react';
import Logo from '../../assets/images/Logo Structify.png';
import profile from '../../assets/images/sample profile.png';
import { useNavigate } from 'react-router-dom';

function AdminHeader() {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/viewProfile');
  };

  return (
    <header
      style={{ backgroundColor: '#30418B' }}
      className="flex items-center justify-between px-6 py-3 shadow-md border-b-1 border-gray-200"
    >
      {/* Logo Section */}
      <div className="flex items-center">
        <img src={Logo} alt="Structify Logo" className="h-12" />
      </div>

      {/* Profile Avatar */}
      <div
        onClick={handleProfileClick}
        className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 cursor-pointer"
        title="View Profile"
      >
        <img src={profile} alt="User Avatar" className="w-full h-full object-cover" />
      </div>
    </header>
  );
}

export default AdminHeader;
