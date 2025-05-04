import React, { useState, useContext } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import Header from '../components/AdminHeader'; // For students; replace with AdminHeader if role is 'admin'
import exit from '../assets/images/X Icon.png'; // Exit icon

function ViewProfile() {
  const { currentUser, role } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigate('/login', { replace: true });
      })
      .catch((error) => {
        console.error('Sign out error:', error);
      });
  };

  return (
    <div className="min-h-screen bg-gray-200 relative">
      <Header />
      {/* 🔙 Exit Button */}
      <div className="flex justify-end m-8">
        <button
            onClick={() => navigate(-1)}
            className="z-10"
          >
            <img src={exit} alt="Close" className="w-6 h-6 cursor-pointer filter invert" />
        </button>
      </div>

      <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">
          {role === 'admin' ? 'Admin Profile' : 'Student Profile'}
        </h2>

        <p className="text-gray-700 mb-2">
          <strong>Name:</strong> {currentUser?.name}
        </p>

        <p className="text-gray-700 mb-2">
          <strong>Email:</strong> {currentUser?.email}
        </p>

        <p className="text-gray-700 mb-2">
          <strong>Role:</strong> {role}
        </p>

        {role === 'student' && (
          <p className="text-gray-700 mb-4">
            <strong>Section:</strong> {currentUser?.section || '—'}
          </p>
        )}

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default ViewProfile;
