import React, { useState, useContext } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import Header from '../components/ProfileHeader ';
import exit from '../assets/images/X Icon.png';
import profile from '../assets/images/sample profile.png';

function ViewProfile() {
  const { currentUser, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  const isStudent = role === 'student';

  return (
    <div className='bg-blue-100 min-h-screen'>
      <Header />

      {/* 🔙 Exit Button */}
      <div className="flex justify-end m-8">
        <button onClick={() => navigate(-1)} className="z-10">
          <img src={exit} alt="Close" className="w-6 h-6 cursor-pointer filter invert" />
        </button>
      </div>

      <div className="max-w-lg mx-auto mt-10 bg-white rounded-3xl shadow-xl p-6 text-center text-gray-800">
        <div className="flex flex-col items-center mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-4 border-yellow-300 mb-2">
            <img src={profile} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-extrabold">{currentUser?.name || 'Player'}</h2>
          {isStudent && (
            <div className="w-full mt-2">
              <p className="text-sm text-gray-500 mb-1">Rank</p>
              <div className="flex justify-center items-center gap-2">
                <span className="bg-yellow-400 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">🥉 Bronze</span>
                <span className="text-sm text-gray-600">980 pts</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-around mb-6">
          <button onClick={() => setActiveTab('profile')} className={`font-semibold ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}>Profile</button>
          {isStudent && (
            <button onClick={() => setActiveTab('ranks')} className={`font-semibold ${activeTab === 'ranks' ? 'text-blue-600 border-b-2 border-purple-600' : 'text-gray-400'}`}>Ranks</button>
          )}
        </div>

        {activeTab === 'profile' && (
          <div className="text-left space-y-3">
            <div>
              <p className="font-bold text-gray-700">Email:</p>
              <p className="text-gray-600">{currentUser?.email}</p>
            </div>

            <div>
              <p className="font-bold text-gray-700">Role:</p>
              <p className="text-gray-600">{role}</p>
            </div>

            {isStudent && (
              <div>
                <p className="font-bold text-gray-700">Section:</p>
                <p className="text-gray-600">{currentUser?.section || '—'}</p>
              </div>
            )}

                {/* 👇 Change Password Link */}
              <div className="pt-4 flex justify-center">
                <a
                  href="#"
                  onClick={() => setShowPasswordModal(true)}
                  className="text-blue py-2 px-4 hover:underline hover:text-blue-500"
                >
                  Change Password
                </a>
              </div>


          </div>
        )}

        {activeTab === 'ranks' && isStudent && (
          <div className="space-y-3 text-left">
            <p className="text-lg font-bold text-purple-700">Leaderboard</p>
            <ul className="space-y-2">
              <li className="bg-gray-100 p-2 rounded-lg flex justify-between items-center">
                <span>🥇 Alice</span>
                <span className="text-sm text-gray-500">1200 pts</span>
              </li>
              <li className="bg-gray-100 p-2 rounded-lg flex justify-between items-center">
                <span>🥈 Bob</span>
                <span className="text-sm text-gray-500">1150 pts</span>
              </li>
              <li className="bg-gray-100 p-2 rounded-lg flex justify-between items-center">
                <span>🥉 You</span>
                <span className="text-sm text-gray-500">980 pts</span>
              </li>
            </ul>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="mt-6 bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg shadow-md font-semibold"
        >
          Sign Out
        </button>
      </div>

      {/* 🔒 Password Modal */}
      {showPasswordModal && (
      <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50">


          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold text-blue-700">Change Password</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                placeholder="Enter new password"
              />
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewProfile;
