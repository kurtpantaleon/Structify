import React, { useState, useContext, useEffect } from 'react';
import { getAuth, signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import Header from '../components/ProfileHeader ';
import exit from '../assets/images/X Icon.png';
import profile from '../assets/images/sample profile.png';
import { Loader2, Medal, User, Mail, UserCircle, Key, LogOut, Book, Trophy } from 'lucide-react';

function ViewProfile() {
  const { currentUser, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  // Password validation function
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push(`At least ${minLength} characters`);
    if (!hasUpperCase) errors.push('One uppercase letter');
    if (!hasLowerCase) errors.push('One lowercase letter');
    if (!hasNumbers) errors.push('One number');
    if (!hasSpecialChar) errors.push('One special character');

    return errors;
  };

  // Password requirement check function
  const checkRequirement = (password, regex) => regex.test(password);

  // Get password strength indicator color
  const getStrengthColor = (password) => {
    if (!password) return 'bg-gray-200';
    const strength = validatePassword(password).length;
    if (strength === 0) return 'bg-green-500';
    if (strength <= 2) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, [currentUser?.uid]);

  // Fetch top users by rankPoints when viewing "Stats"
  useEffect(() => {
    if (role !== 'student' || activeTab !== 'ranks') return;
    const fetchLeaderboard = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          orderBy('rankPoints', 'desc'),
          limit(10)
        );
        const snap = await getDocs(q);
        setLeaderboard(
          snap.docs.map((d, i) => ({ uid: d.id, ...d.data(), position: i + 1 }))
        );
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    };
    fetchLeaderboard();
  }, [role, activeTab]);

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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    // Validate new password
    const passwordErrors = validatePassword(passwordForm.newPassword);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('. '));
      setIsLoading(false);
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      const credential = EmailAuthProvider.credential(
        passwordForm.email,
        passwordForm.currentPassword
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordForm.newPassword);

      setSuccess(true);
      setPasswordForm({ email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => {
        setShowPasswordModal(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(
        err.code === 'auth/wrong-password' 
          ? 'Current password is incorrect' 
          : err.code === 'auth/user-mismatch'
          ? 'Email does not match current user'
          : 'Failed to change password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isStudent = role === 'student';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />

      <div className="flex justify-end m-8">
        <button 
          onClick={() => navigate(-1)} 
          className="z-10 transition-transform hover:scale-110"
        >
          <img src={exit} alt="Close" className="w-6 h-6 cursor-pointer filter invert" />
        </button>
      </div>

      <div className="max-w-lg mx-auto mt-10 relative">
        {isLoadingUser ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-6 text-center text-gray-800 transform transition-all duration-300 hover:shadow-2xl">
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-500 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    <img src={profile} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>
                {isStudent && userData?.rankPoints >= 1000 && (
                  <div className="absolute -top-2 -right-2">
                    <Medal className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold mt-3 bg-gradient-to-r bg-blue-500 bg-clip-text text-transparent">
                {userData?.name || currentUser?.name || 'Player'}
              </h2>
              {isStudent && (
                <div className="w-full mt-3">
                  <p className="text-sm text-gray-500 mb-2 font-medium">Current Rank</p>
                  <div className="flex justify-center items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-md ${
                      userData?.rankPoints >= 1000 
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-500 text-white'
                    }`}>
                      {userData?.rankPoints >= 1000 ? '🏆 Gold' : '🥉 Bronze'}
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      {userData?.rankPoints || 0} pts
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-around mb-6 mt-8">
              <button 
                onClick={() => setActiveTab('profile')} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'profile' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              {isStudent && (
                <button 
                  onClick={() => setActiveTab('ranks')} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'ranks' 
                      ? 'bg-purple-50 text-purple-600' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  Stats
                </button>
              )}
            </div>

            {activeTab === 'profile' && (
              <div className="space-y-4 bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-800">{userData?.email || currentUser?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <UserCircle className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Role</p>
                    <p className="text-sm text-gray-800 capitalize">{role}</p>
                  </div>
                </div>

                {isStudent && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <Book className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs font-medium text-gray-500">Section</p>
                      <p className="text-sm text-gray-800">{userData?.section || '—'}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 mt-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <Key className="w-4 h-4" />
                  Change Password
                </button>
              </div>
            )}

            {activeTab === 'ranks' && isStudent && (
              <div className="space-y-4 bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2 justify-center">
                  <Trophy className="w-5 h-5" /> Leaderboard
                </h3>
                <div className="space-y-2">
                  {leaderboard.map(user => {
                    const bg = user.position === 1
                      ? 'from-yellow-50 to-yellow-100'
                      : user.position === 2
                      ? 'from-gray-50 to-gray-100'
                      : user.position === 3
                      ? 'from-orange-50 to-orange-100'
                      : 'from-white to-white';
                    const emoji = {1:'🥇',2:'🥈',3:'🥉'}[user.position] || `${user.position}.`;
                    return (
                      <div
                        key={user.uid}
                        className={`bg-gradient-to-r ${bg} p-3 rounded-lg flex justify-between items-center`}
                      >
                        <span className="flex items-center gap-2 font-medium">
                          {emoji} <span className={`${user.position===1?'text-yellow-700':user.position===2?'text-gray-700':user.position===3?'text-orange-700':'text-gray-800'}`}>
                            {user.name || user.email}
                          </span>
                        </span>
                        <span className={`text-sm font-medium ${
                          user.position===1?'text-yellow-600':user.position===2?'text-gray-600':user.position===3?'text-orange-600':'text-gray-600'
                        }`}>
                          {user.rankPoints || 0} pts
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="mt-6 flex items-center gap-2 mx-auto px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6 animate-fade-scale">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                <Key className="w-6 h-6" />
                Change Password
              </h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setError('');
                  setSuccess(false);
                  setPasswordForm({ email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3 border border-red-100">
                <div className="w-5 h-5 mt-0.5 flex-shrink-0">⚠️</div>
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm flex items-center gap-3 border border-green-100">
                <div className="w-5 h-5">✅</div>
                <p className="leading-relaxed">Password updated successfully!</p>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={passwordForm.email}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, email: e.target.value }))}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm"
                  placeholder={currentUser?.email || "Confirm your email"}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm"
                      placeholder="Enter new password"
                      required
                      minLength={8}
                    />
                    <div className={`absolute right-3 top-3 w-2 h-2 rounded-full ${getStrengthColor(passwordForm.newPassword)}`} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-2 ${checkRequirement(passwordForm.newPassword, /[A-Z]/) ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className="w-4">{checkRequirement(passwordForm.newPassword, /[A-Z]/) ? '✓' : '○'}</div>
                    Uppercase letter
                  </div>
                  <div className={`flex items-center gap-2 ${checkRequirement(passwordForm.newPassword, /[a-z]/) ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className="w-4">{checkRequirement(passwordForm.newPassword, /[a-z]/) ? '✓' : '○'}</div>
                    Lowercase letter
                  </div>
                  <div className={`flex items-center gap-2 ${checkRequirement(passwordForm.newPassword, /\d/) ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className="w-4">{checkRequirement(passwordForm.newPassword, /\d/) ? '✓' : '○'}</div>
                    Number
                  </div>
                  <div className={`flex items-center gap-2 ${checkRequirement(passwordForm.newPassword, /[!@#$%^&*(),.?":{}|<>]/) ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className="w-4">{checkRequirement(passwordForm.newPassword, /[!@#$%^&*(),.?":{}|<>]/) ? '✓' : '○'}</div>
                    Special character
                  </div>
                  <div className={`flex items-center gap-2 ${passwordForm.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className="w-4">{passwordForm.newPassword.length >= 8 ? '✓' : '○'}</div>
                    8+ characters
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`block w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm ${
                    passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                      ? 'border-red-300'
                      : passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword
                      ? 'border-green-300'
                      : 'border-gray-200'
                  }`}
                  placeholder="Confirm new password"
                  required
                />
                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setError('');
                    setSuccess(false);
                    setPasswordForm({ email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium transition-colors hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || (passwordForm.newPassword !== passwordForm.confirmPassword)}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 text-sm ${
                    isLoading || (passwordForm.newPassword !== passwordForm.confirmPassword)
                      ? 'bg-blue-400 text-white cursor-not-allowed opacity-80'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewProfile;
