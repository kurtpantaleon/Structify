import React, { useContext, useState, useEffect } from 'react';
import Logo from '../assets/images/Logo Structify.png';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';

function Login() {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Wrong Email or Password!");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  useEffect(() => {
    // Check if email was saved in local storage
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address first.');
      setError(true);
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError(false);
    } catch (err) {
      console.error('Password reset failed:', err.message);
      setErrorMessage('Failed to send reset email. Please check your email address.');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 🔍 Fetch user document from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const { role, name, section } = userData;

        // Remember user if checkbox is checked
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        console.log('User role:', role);

        // ✅ Dispatch all user info to AuthContext
        dispatch({
          type: 'LOGIN',
          payload: {
            user: {
              uid: user.uid,
              email: user.email,
              name,
              section,
            },
            role,
          },
        });

        // ✅ Redirect based on role
        if (role === 'admin') {
          navigate('/adminPage', { replace: true });
        } else if (role === 'student') {
          navigate('/mainPage', { replace: true });
        } else if (role === 'instructor') {
          navigate('/instructorPage', { replace: true });
        } else {
          setErrorMessage('No valid role found for this account.');
          setError(true);
          console.error('No valid role found.');
        }
      } else {
        setErrorMessage('User data not found. Please contact support.');
        setError(true);
        console.error('User data not found in Firestore.');
      }
    } catch (err) {
      console.error('Login failed:', err.message);
      
      // More specific error messages
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMessage('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Too many failed login attempts. Please try again later.');
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
      
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] w-screen h-screen overflow-hidden">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a href="#" className="flex flex-col items-center mb-8 text-2xl font-semibold text-white">
          <img className="h-20 mb-2" src={Logo} alt="Structify Logo" />
          <span className="text-white text-xl md:text-2xl font-bold drop-shadow-md">Structify</span>
        </a>
        
        <div className="w-full bg-white rounded-xl shadow-lg sm:max-w-md xl:p-0 dark:bg-gray-800 transition-all duration-300 hover:shadow-2xl">
          <div className="p-6 space-y-5 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-center text-gray-900 md:text-2xl dark:text-white">
              Welcome Back
              <p className="text-base font-normal text-gray-500 mt-1 dark:text-gray-300">Sign in to your account</p>
            </h1>
            
            {resetSent && (
              <div className="p-3 mb-4 bg-green-100 border border-green-200 text-green-700 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Password reset link sent! Please check your email.
                </div>
              </div>
            )}
            
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    placeholder="email@plv.edu.ph"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-3 pr-10 focus:ring-2 focus:ring-[#2e3a6c] focus:border-[#2e3a6c] dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <svg className="w-5 h-5 absolute right-3 top-3.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-white">
                    Password
                  </label>
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-3 pr-10 focus:ring-2 focus:ring-[#2e3a6c] focus:border-[#2e3a6c] dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <svg className="w-5 h-5 absolute right-3 top-3.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="w-4 h-4 text-[#1F274D] bg-gray-100 border-gray-300 rounded focus:ring-[#2e3a6c] dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-500 text-sm rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    {errorMessage}
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white font-medium rounded-lg text-base px-5 py-3.5 text-center bg-[#1F274D] hover:bg-[#2e3a6c] transition-all duration-200 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
