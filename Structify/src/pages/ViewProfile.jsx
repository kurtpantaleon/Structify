import React, { useState, useContext } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext'; // Adjust path if you split files

import Header from '../components/AdminHeader';
import AdminNavigationBar from '../components/AdminNavigationBar';
import AdminSubHeading from '../components/AdminSubHeading';

function ViewProfile() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { currentUser, role } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigate('/login', { replace: true }); // Prevent back button to protected pages
      })
      .catch((error) => {
        console.error('Sign out error:', error);
      });
  };

  return (
    <div className="min-h-screen bg-gray-200 relative">
      {/* Admin Header */}
      <Header />

      {/* Admin Subheading + Nav Toggle */}
      <AdminSubHeading toggleNav={() => setIsNavOpen(!isNavOpen)} title="Profile" />

      {/* Sidebar Navigation */}
      {isNavOpen && (
        <div className="w-20 border-r border-white/20 bg-[#141a35]">
          <AdminNavigationBar />
        </div>
      )}

      {/* Profile Card */}
      <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Admin Profile</h2>
        <p className="text-gray-700 mb-2">
          <strong>Email:</strong> {currentUser?.email}
        </p>
        <p className="text-gray-700 mb-4">
          <strong>Role:</strong> {role}
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default ViewProfile;
