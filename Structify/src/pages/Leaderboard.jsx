// Gamified Leaderboard UI (Fixed Row Podium Left, Scrollable Table Right)
import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; 
import { db } from '../services/firebaseConfig';
import Header from '../components/admin/AdminHeader';
import Goldrank from '../assets/images/Gold Rank.png';
import Silverrank from '../assets/images/Silver Rank.png';
import Bronzerank from '../assets/images/Bronze Rank.png';
import fire from '../assets/images/fire.png';
import profile from '../assets/images/sample profile.png';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowSize } from 'react-use';
import { X, Search, ChevronDown, RefreshCw, Trophy, Users, BarChart, Activity, BookOpen, Target } from 'lucide-react';
import { AuthContext } from '../context/authContext';


function Leaderboard() {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [celebrate, setCelebrate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userRank, setUserRank] = useState(null);
  const [activeTab, setActiveTab] = useState('leaderboard');
  
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const { currentUser } = useContext(AuthContext);
  
  // Function to refresh leaderboard data
  const refreshLeaderboard = async () => {
    if (!selectedSection) return;
    
    setRefreshing(true);
    
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'student'),
        where('section', '==', selectedSection),
        orderBy('rankPoints', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          rankPoints: docData.rankPoints ?? 0,
        };
      });
      
      setStudents(data);
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 3000);
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchSections = async () => {
      setIsLoading(true);
      try {
        const snapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
        const allSections = snapshot.docs.map(doc => doc.data().section);
        const uniqueSections = [...new Set(allSections.filter(Boolean))];
        setSections(uniqueSections);
        if (uniqueSections.length > 0) {
          setSelectedSection(uniqueSections[0]);
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSections();
  }, []);

  useEffect(() => {
    if (!selectedSection) return;
    setIsLoading(true);

    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('section', '==', selectedSection),
      orderBy('rankPoints', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          rankPoints: docData.rankPoints ?? 0,
        };
      });
      
      setStudents(data);
      
      // Find user's rank if they are logged in
      if (currentUser && currentUser.user) {
        const userIndex = data.findIndex(student => student.id === currentUser.user.uid);
        setUserRank(userIndex !== -1 ? userIndex + 1 : null);
      }
      
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 3000);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching leaderboard:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedSection, currentUser]);
  // Function to filter students based on search query
  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to handle section change
  const handleSectionChange = (section) => {
    setSelectedSection(section);
    setShowDropdown(false);
  };

  // Function to scroll to user's position
  const scrollToUserRank = () => {
    if (userRank !== null) {
      const userElement = document.getElementById(`student-rank-${userRank}`);
      if (userElement) {
        userElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight briefly
        userElement.classList.add('highlight-rank');
        setTimeout(() => {
          userElement.classList.remove('highlight-rank');
        }, 2000);
      }
    }
  };

  const topThree = [students[1], students[0], students[2]];
  const rankImages = [Silverrank, Goldrank, Bronzerank];
  
  return (
    <div className="bg-[#0e1344] min-h-screen text-white relative overflow-hidden font-sans">
      <Header />

      {/* Background particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Confetti
          width={width}
          height={height}
          numberOfPieces={30}
          gravity={0.15}
          colors={["#f87171", "#60a5fa", "#fbbf24", "#34d399", "#a78bfa"]}
          recycle={true}
        />
      </div>

      <div className="pt-6 px-4 pb-6 relative z-10">
        {/* Back button */}
        <div className="absolute top-6 right-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-300 transform hover:scale-110 shadow-lg"
            aria-label="Go back"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Celebration confetti for rank changes */}
        {celebrate && (
          <Confetti 
            numberOfPieces={100} 
            recycle={false} 
            colors={["#FFD700", "#FFC0CB", "#00FFFF", "#ff4500", "#7FFFD4"]}
          />
        )}

        {/* Title with animated elements */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
          className="pt-10 text-center mb-8"
        >
          <h1 className="text-5xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 font-bold tracking-widest mb-2">
            🏆 LEADERBOARD 🏆
          </h1>
          <p className="text-blue-300 text-lg">Compete for the top position!</p>
        </motion.div>        {/* Navigation tabs with enhanced styling */}
        <div className="relative flex justify-center gap-2 md:gap-4 mb-8">
          <div className="absolute h-1 bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-900 bottom-0 w-full max-w-md rounded-full -z-10"></div>
          
          <motion.button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-3 rounded-t-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'leaderboard' 
                ? 'bg-indigo-600 text-white shadow-md translate-y-0' 
                : 'bg-[#141a35] text-gray-300 hover:bg-[#1c2447] hover:text-white translate-y-1'
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Trophy className={`w-5 h-5 ${activeTab === 'leaderboard' ? 'text-yellow-300' : ''}`} />
            <span>Leaderboard</span>
            {activeTab === 'leaderboard' && (
              <motion.div
                layoutId="activeTab"
                className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
          
          <motion.button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-3 rounded-t-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'stats' 
                ? 'bg-indigo-600 text-white shadow-md translate-y-0' 
                : 'bg-[#141a35] text-gray-300 hover:bg-[#1c2447] hover:text-white translate-y-1'
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <BarChart className={`w-5 h-5 ${activeTab === 'stats' ? 'text-blue-300' : ''}`} />
            <span>Stats</span>
            {activeTab === 'stats' && (
              <motion.div
                layoutId="activeTab"
                className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
          
          <motion.button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-3 rounded-t-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'progress' 
                ? 'bg-indigo-600 text-white shadow-md translate-y-0' 
                : 'bg-[#141a35] text-gray-300 hover:bg-[#1c2447] hover:text-white translate-y-1'
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Activity className={`w-5 h-5 ${activeTab === 'progress' ? 'text-green-300' : ''}`} />
            <span>Progress</span>
            {activeTab === 'progress' && (
              <motion.div
                layoutId="activeTab"
                className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        </div>
        
        {/* Achievement banner - only shows when there's a new achievement */}
        <AnimatePresence>
          {activeTab === 'progress' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="max-w-4xl mx-auto mb-6 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-4 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-bold text-white">New Achievement Unlocked!</h3>
                  <p className="text-sm text-amber-200">7 Day Study Streak - Keep up the good work!</p>
                </div>
                <button className="ml-auto bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg text-sm">
                  View
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls and filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-4xl mx-auto mb-8 gap-4">
          {/* Section selector dropdown */}
          <div className="relative w-full sm:w-auto">
            <div 
              className="flex items-center justify-between bg-[#141a35] hover:bg-[#1c2447] p-3 rounded-lg border border-indigo-700 cursor-pointer transition-all duration-200"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="flex items-center">
                <Users className="w-5 h-5 text-indigo-400 mr-2" />
                <span className="text-white font-medium">{selectedSection || "Select section"}</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showDropdown ? "transform rotate-180" : ""}`} />
            </div>
            
            {showDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-20 mt-1 w-full bg-[#1c2447] rounded-lg border border-indigo-700 shadow-xl py-1 max-h-60 overflow-y-auto"
              >
                {sections.map((section, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-2 cursor-pointer hover:bg-indigo-700 transition-colors duration-150 ${selectedSection === section ? "bg-indigo-800" : ""}`}
                    onClick={() => handleSectionChange(section)}
                  >
                    {section}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
          
          {/* Search field */}
          <div className="relative w-full sm:w-auto">
            <div className="flex items-center bg-[#141a35] hover:bg-[#1c2447] rounded-lg border border-indigo-700 overflow-hidden">
              <input
                type="text"
                className="bg-transparent text-white px-4 py-3 flex-grow focus:outline-none w-full"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="px-3">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            {userRank !== null && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg flex items-center transition-all duration-200"
                onClick={scrollToUserRank}
              >
                <Trophy className="w-5 h-5 mr-2" />
                <span>My Rank</span>
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center transition-all duration-200 ${refreshing ? "opacity-70" : ""}`}
              onClick={refreshLeaderboard}
              disabled={refreshing}
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Updating..." : "Refresh"}</span>
            </motion.button>
          </div>
        </div>        {/* Main content area with podium and leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-12">
            {/* Podium Row with enhanced visuals */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="lg:sticky lg:top-24 lg:self-start lg:min-w-[400px] lg:max-w-[500px] flex justify-center gap-4 lg:gap-6 z-10"
            >
              {[0, 1, 2].map((order) => {
                const student = topThree[order];
                const isAvailable = student && student.name;
                const podiumHeight = order === 1 ? 'h-[280px]' : order === 0 ? 'h-[240px]' : 'h-[220px]';
                
                return (
                  <motion.div
                    key={order}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`flex flex-col items-center p-0 w-[32%] ${
                      order === 1 ? 'mt-0' : order === 0 ? 'mt-10' : 'mt-14'
                    }`}
                  >
                    <div className="relative w-full flex flex-col items-center">
                      {/* Medal position indicator */}
                      <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + order * 0.2, duration: 0.7 }}
                        className={`absolute -top-8 text-xl font-bold ${
                          order === 1 ? 'text-yellow-300' : order === 0 ? 'text-gray-300' : 'text-amber-700'
                        }`}
                      >
                        {order === 1 ? '1st' : order === 0 ? '2nd' : '3rd'}
                      </motion.div>
                      
                      <img 
                        src={rankImages[order]} 
                        alt={`${order === 1 ? 'Gold' : order === 0 ? 'Silver' : 'Bronze'} Rank`} 
                        className={`w-full h-auto drop-shadow-xl ${podiumHeight}`} 
                      />
                      
                      {/* Profile section with animation */}
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 + order * 0.2, duration: 0.5 }}
                        className={`absolute ${
                          order === 1 ? 'top-8' : order === 0 ? 'top-6' : 'top-5'
                        } left-1/2 transform -translate-x-1/2 flex flex-col items-center`}
                      >
                        {/* Profile image with animated border */}
                        <div className={`rounded-full p-1 ${
                          order === 1 
                            ? 'bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 animate-pulse-slow' 
                            : order === 0 
                              ? 'bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300' 
                              : 'bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700'
                        }`}>
                          <img 
                            src={profile} 
                            alt="avatar" 
                            className={`rounded-full border-2 border-white ${
                              order === 1 ? 'w-16 h-16' : 'w-14 h-14'
                            }`}
                          />
                        </div>
                        
                        {/* User name with better overflow handling */}
                        <div className="text-center text-sm font-bold mt-2 max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {isAvailable ? student.name : 'Unranked'}
                        </div>
                        
                        {/* Score badge with enhanced visual */}
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className={`mt-2 bg-gradient-to-r px-3 py-1.5 rounded-full flex items-center justify-center gap-1 shadow-lg ${
                            order === 1 
                              ? 'from-amber-500 to-yellow-500' 
                              : order === 0 
                                ? 'from-slate-400 to-gray-500' 
                                : 'from-amber-800 to-amber-600'
                          }`}
                        >
                          <img src={fire} alt="fire" className="w-4 h-4" />
                          <span className="font-bold text-sm">{isAvailable ? student.rankPoints : 0}</span>
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Enhanced Scrollable Table */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-xl bg-gradient-to-b from-[#1e245e] to-[#262f7a] rounded-3xl shadow-2xl overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
                </div>
              ) : (
                <>
                  {/* Table header with improved styling */}
                  <div className="bg-[#191e4a] px-6 py-4">
                    <div className="flex text-white text-base font-bold">
                      <div className="w-1/4 text-center">RANK</div>
                      <div className="w-1/2 text-center">NAME</div>
                      <div className="w-1/4 text-center">SCORE</div>
                    </div>
                  </div>
                  
                  {/* Table body with enhanced scrolling and feedback */}
                  <div className="max-h-[60vh] overflow-y-auto p-4">
                    <div className="space-y-2">
                      <AnimatePresence>
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student, index) => {
                            const isCurrentUser = currentUser && student.id === currentUser.user?.uid;
                            return (
                              <motion.div
                                id={`student-rank-${index + 1}`}
                                key={student.id || index}
                                className={`flex items-center text-sm py-3 px-5 rounded-xl transition-all duration-300 ${
                                  index < 3 
                                    ? 'bg-gradient-to-r from-[#4c51bf] to-[#6b46c1] shadow-lg' 
                                    : isCurrentUser 
                                      ? 'bg-gradient-to-r from-[#3d4294] to-[#5b42a9] border border-blue-400 shadow-md' 
                                      : 'bg-[#2d356c] hover:bg-[#3a418c]'
                                }`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                whileHover={{ scale: 1.01 }}
                              >
                                {/* Rank column with enhanced visual indicators */}
                                <div className="w-1/4 text-center font-bold flex justify-center items-center">
                                  {index === 0 ? (
                                    <span className="text-xl">🏆</span>
                                  ) : index === 1 ? (
                                    <span className="text-lg">🥈</span>
                                  ) : index === 2 ? (
                                    <span className="text-lg">🥉</span>
                                  ) : (
                                    <span 
                                      className={`flex items-center justify-center rounded-full w-7 h-7 text-sm ${
                                        isCurrentUser ? 'bg-blue-600 text-white' : 'bg-[#212852] text-gray-300'
                                      }`}
                                    >
                                      {index + 1}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Name column with improved layout */}
                                <div className="flex items-center gap-3 pl-2 w-1/2">
                                  <div className="relative">
                                    <img 
                                      src={profile} 
                                      alt="profile" 
                                      className={`w-8 h-8 rounded-full ${
                                        isCurrentUser ? 'border-2 border-blue-400' : 'border border-gray-300'
                                      }`} 
                                    />
                                    {isCurrentUser && (
                                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-3 h-3 border border-white"></div>
                                    )}
                                  </div>
                                  <span className="font-semibold text-white text-sm truncate">
                                    {student.name}
                                    {isCurrentUser && <span className="ml-2 text-xs text-blue-300">(You)</span>}
                                  </span>
                                </div>
                                
                                {/* Score column with enhanced visual */}
                                <div className="w-1/4 text-center">
                                  <span className={`inline-flex items-center justify-center font-bold ${
                                    index < 3 ? 'text-yellow-300' : isCurrentUser ? 'text-blue-300' : 'text-yellow-200'
                                  }`}>
                                    {student.rankPoints}
                                    <img src={fire} alt="points" className="w-4 h-4 ml-1 animate-pulse" />
                                  </span>
                                </div>
                              </motion.div>
                            );
                          })
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-10"
                          >
                            <div className="text-gray-400 text-lg mb-3">No students found</div>
                            <button 
                              onClick={() => setSearchQuery('')}
                              className="px-4 py-2 bg-indigo-600 rounded-lg text-sm hover:bg-indigo-700"
                            >
                              Clear search
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </>
              )}
            </motion.div>       
           </div>
        )}
        {/* Progress Tab Content */}
        {activeTab === 'progress' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto bg-gradient-to-b from-[#1e245e] to-[#262f7a] rounded-3xl shadow-2xl overflow-hidden p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Completion Rate Circle */}
              <div className="bg-[#191e4a] rounded-2xl p-6 shadow-lg flex flex-col items-center">
                <h3 className="text-xl font-semibold text-indigo-200 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Completion Rate
                </h3>
                
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="85"
                      fill="none"
                      stroke="#2d356c"
                      strokeWidth="12"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="85"
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="12"
                      strokeDasharray={`${85 * 2 * Math.PI}`}
                      strokeDashoffset={`${85 * 2 * Math.PI * (1 - 0.85)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute text-4xl font-bold text-white">85%</div>
                </div>
                
                <p className="text-gray-300 mt-4 text-center">
                  You've completed 20 out of 24 Activities
                </p>
              </div>
              
              {/* Activity Stats */}
              <div className="bg-[#191e4a] rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-indigo-200 mb-6 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Activity Progress
                </h3>
                
                <div className="space-y-6">
                  {/* Individual progress bars */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Activities</span>
                      <span className="text-indigo-300 font-semibold">8/10</span>
                    </div>
                    <div className="w-full bg-[#2d356c] rounded-full h-2.5">
                      <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Quizzes</span>
                      <span className="text-indigo-300 font-semibold">5/6</span>
                    </div>
                    <div className="w-full bg-[#2d356c] rounded-full h-2.5">
                      <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '83%' }}></div>
                    </div>
                  </div>
              
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Exercises</span>
                      <span className="text-indigo-300 font-semibold">4/4</span>
                    </div>
                    <div className="w-full bg-[#2d356c] rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
                {/* Streak */}
              <div className="bg-[#191e4a] rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-indigo-200 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Current Streak
                </h3>
                
                <div className="flex justify-center items-center gap-2">
                  <span className="text-5xl font-bold text-amber-400">7</span>
                  <span className="text-gray-300 text-xl">days</span>
                </div>
                
                <div className="mt-6 grid grid-cols-7 gap-2">
                  {[...Array(7)].map((_, index) => (
                    <div key={index} className="flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mb-1">
                        <span className="text-xs font-semibold text-white">{index + 1}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Learning Path Progress Timeline */}
              <div className="bg-[#191e4a] rounded-2xl p-6 shadow-lg md:col-span-2">
                <h3 className="text-xl font-semibold text-indigo-200 mb-6 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Learning Path Progress
                </h3>
                
                <div className="relative">
                  {/* Progress line */}
                  <div className="absolute left-4 top-2 bottom-10 w-1 bg-gradient-to-b from-indigo-600 to-indigo-800 rounded-full"></div>
                  
                  {/* Timeline items */}
                  <div className="space-y-8 relative">
                    {/* Completed module */}
                    <div className="flex">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-6">
                        <h4 className="text-lg font-semibold text-white">Introduction to Data Structures</h4>
                        <p className="text-indigo-200 mt-1">Completed on May 5, 2025</p>
                        <div className="mt-2 flex items-center">
                          <div className="bg-green-900 text-green-200 text-xs px-2 py-1 rounded-md">100% Complete</div>
                          <span className="text-green-400 ml-3 flex items-center">
                            <Trophy className="w-4 h-4 mr-1" />
                            120 points earned
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Current module */}
                    <div className="flex">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-300 animate-pulse-slow flex items-center justify-center">
                          <span className="text-white text-xs font-bold">75%</span>
                        </div>
                      </div>
                      <div className="ml-6">
                        <h4 className="text-lg font-semibold text-white">Algorithms and Complexity</h4>
                        <p className="text-blue-300 mt-1">In Progress - 3/4 sections completed</p>
                        <div className="mt-3 w-full bg-[#2d356c] rounded-full h-2.5">
                          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <div className="bg-green-800 text-green-200 text-xs px-2 py-1 rounded-md">Search Algorithms ✓</div>
                          <div className="bg-green-800 text-green-200 text-xs px-2 py-1 rounded-md">Sorting Algorithms ✓</div>
                          <div className="bg-green-800 text-green-200 text-xs px-2 py-1 rounded-md">Graph Algorithms ✓</div>
                          <div className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-md">Advanced Topics</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Locked module */}
                    <div className="flex opacity-50">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 116 0z" clipRule="evenodd" />
                      </svg>
                        </div>
                      </div>
                      <div className="ml-6">
                        <h4 className="text-lg font-semibold text-gray-400">Advanced Data Structures</h4>
                        <p className="text-gray-500 mt-1">Unlocks after completing current module</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-[#191e4a] rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-indigo-200 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-[#2d356c] p-3 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Completed Quiz #5</h4>
                      <p className="text-xs text-blue-300">Today, 10:20 AM</p>
                    </div>
                    <div className="ml-auto text-green-400 font-bold">+15 pts</div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-[#2d356c] p-3 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Submitted Activities #8</h4>
                      <p className="text-xs text-blue-300">Yesterday, 6:45 PM</p>
                    </div>
                    <div className="ml-auto text-green-400 font-bold">+25 pts</div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-[#2d356c] p-3 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Completed Exercise #4</h4>
                      <p className="text-xs text-blue-300">2 days ago, 3:15 PM</p>
                    </div>
                    <div className="ml-auto text-green-400 font-bold">+10 pts</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Stats Tab Content */}
        {activeTab === 'stats' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto bg-gradient-to-b from-[#1e245e] to-[#262f7a] rounded-3xl shadow-2xl overflow-hidden p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Overall Rank */}
              <div className="bg-[#191e4a] rounded-2xl p-6 shadow-lg flex flex-col items-center">
                <h3 className="text-xl font-semibold text-indigo-200 mb-4">Overall Ranking</h3>
                
                <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-2">
                  {userRank || '-'}
                </div>
                
                <p className="text-gray-300">of {students.length} students</p>
                
                <div className="mt-4 w-full bg-[#2d356c] h-2 rounded-full">
                  <div 
                    className="bg-gradient-to-r from-indigo-600 to-blue-500 h-2 rounded-full" 
                    style={{ width: `${userRank ? (1 - (userRank / students.length)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Point Distribution */}              <div className="bg-[#191e4a] rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-indigo-200 mb-4">Point Distribution</h3>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300">Activities</span>
                      <span className="text-indigo-300 font-semibold">245 pts</span>
                    </div>
                    <div className="w-full bg-[#2d356c] rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300">Quizzes</span>
                      <span className="text-indigo-300 font-semibold">180 pts</span>
                    </div>
                    <div className="w-full bg-[#2d356c] rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300">Participation</span>
                      <span className="text-indigo-300 font-semibold">25 pts</span>
                    </div>
                    <div className="w-full bg-[#2d356c] rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 pt-5 border-t border-[#2d356c]">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Points</span>
                    <span className="text-xl font-bold text-indigo-300">525</span>
                  </div>
                </div>
              </div>
              
              {/* Achievements Section */}
              <div className="md:col-span-2 bg-[#191e4a] rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-indigo-200 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                    Achievements
                  </h3>
                  <button className="text-indigo-300 hover:text-indigo-100 text-sm">View All</button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {/* Unlocked achievement */}
                  <div className="bg-gradient-to-b from-[#2d356c] to-[#222a50] p-3 rounded-xl flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-600 flex items-center justify-center mb-2">
                      <Trophy className="w-6 h-6 text-yellow-300" />
                    </div>
                    <span className="text-center font-medium text-white text-sm">Week Warrior</span>
                    <span className="text-xs text-yellow-300">7-day streak</span>
                  </div>
                  
                  <div className="bg-gradient-to-b from-[#2d356c] to-[#222a50] p-3 rounded-xl flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center mb-2">
                      <Target className="w-6 h-6 text-indigo-300" />
                    </div>
                    <span className="text-center font-medium text-white text-sm">Perfect Score</span>
                    <span className="text-xs text-indigo-300">Quiz master</span>
                  </div>
                  
                  <div className="bg-gradient-to-b from-[#2d356c] to-[#222a50] p-3 rounded-xl flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-green-700 flex items-center justify-center mb-2">
                      <BookOpen className="w-6 h-6 text-green-300" />
                    </div>
                    <span className="text-center font-medium text-white text-sm">Fast Learner</span>
                    <span className="text-xs text-green-300">Quick completion</span>
                  </div>
                  
                  {/* Locked achievement */}
                  <div className="bg-gradient-to-b from-[#2d356c] to-[#222a50] p-3 rounded-xl flex flex-col items-center opacity-50">
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-2">
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 116 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-center font-medium text-gray-400 text-sm">Top Coder</span>
                    <span className="text-xs text-gray-500">???</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#2d356c] flex justify-between items-center">
                  <span className="text-gray-300">Achievement progress</span>
                  <span className="font-semibold text-indigo-300">3/10 unlocked</span>
                </div>
                <div className="w-full bg-[#2d356c] rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
        {/* CSS for animations */}
      <style>{`
        .highlight-rank {
          animation: highlight-pulse 2s ease-in-out;
        }
        
        @keyframes highlight-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(96, 165, 250, 0); }
          50% { box-shadow: 0 0 0 8px rgba(96, 165, 250, 0.4); }
        }
        
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        /* Tab transition animations */
        .tab-enter {
          opacity: 0;
          transform: translateY(10px);
        }
        
        .tab-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 300ms, transform 300ms;
        }
        
        .tab-exit {
          opacity: 1;
          transform: translateY(0);
        }
        
        .tab-exit-active {
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 300ms, transform 300ms;
        }
        
        /* Progress bar animation */
        @keyframes progress-fill {
          0% { width: 0; }
          100% { width: 100%; }
        }
        
        .progress-bar-animate {
          animation: progress-fill 1.5s ease-out forwards;
        }
        
        /* Badge shine effect */
        .badge-shine {
          position: relative;
          overflow: hidden;
        }
        
        .badge-shine::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to right, 
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(30deg);
          animation: shine 3s infinite;
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(30deg); }
          100% { transform: translateX(100%) rotate(30deg); }
        }
      `}</style>
    </div>
  );
}

export default Leaderboard;
