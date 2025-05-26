import React, { useEffect, useState } from 'react';
import ProfileIcon from '../assets/images/sample profile.png';
import StatsIcon from '../assets/images/stats.png';
import FireIcon from '../assets/images/fire.png';
import ChallengeIcon from '../assets/images/challngeBg.png';
import ButtonBg from '../assets/images/buttonBg.png';
import { getDoc, doc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../services/firebaseConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import { Swords, Target, Search, Users } from 'lucide-react';

// Weeks data
const weeks = [
  {
    week: 'Week 1',
    topic: 'Introduction to Data Structures',
    expectedActivities: ['activity1', 'activity2', 'activity3'],
    expectedLessons: ['lesson1', 'lesson2', 'lesson3']
  },
  {
    week: 'Week 2',
    topic: 'Algorithms & Complexity',
    expectedActivities: ['Week2activity1', 'Week2activity2', 'Week2activity3'],
    expectedLessons: ['Week2lesson1', 'Week2lesson2', 'Week2lesson3']
  },
  {
    week: 'Week 3',
    topic: 'String Processing',
    expectedActivities: ['Week3activity1', 'Week3activity2', 'Week3activity3'],
    expectedLessons: ['Week3lesson1', 'Week3lesson2', 'Week3lesson3']
  },
  {
    week: 'Week 4 and 5',
    topic: 'Arrays, Records, and Pointers',
    expectedActivities: ['Week4activity1', 'Week4activity2', 'Week4activity3'],
    expectedLessons: ['Week4lesson1', 'Week4lesson2', 'Week4lesson3']
  },
  {
    week: 'Week 6',
    topic: 'Linked Lists',
    expectedActivities: ['Week6activity1', 'Week6activity2', 'Week6activity3'],
    expectedLessons: ['Week6lesson1', 'Week6lesson2', 'Week6lesson3']
  },
  {
    week: 'Week 7 and 8',
    topic: 'Stacks, Queues, and Recursion',
    expectedActivities: ['Week7activity1', 'Week7activity2', 'Week7activity3'],
    expectedLessons: ['Week7lesson1', 'Week7lesson2', 'Week7lesson3']
  },
  {
    week: 'Week 10',
    topic: 'Trees',
    expectedActivities: ['Week10activity1', 'Week10activity2', 'Week10activity3'],
    expectedLessons: ['Week10lesson1', 'Week10lesson2', 'Week10lesson3']
  },
  {
    week: "Week 12 and 13",
    topic: "Graph Algorithms",
    path: " ",
    expectedActivities: [],
    expectedLessons: []
  },
  {
    week: "Week 14 and 16",
    topic: "Sorting and Searching",
    path: "",
    expectedActivities: [],
    expectedLessons: []
  },
  {
    week: "Week 17",
    topic: "Hashing",
    path: "",
    expectedActivities: [],
    expectedLessons: []
  }
];

// Reusable styles
const styles = {
  container: "w-full max-w-2xl mx-auto text-white rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm bg-opacity-95",
  header: "flex justify-center items-center gap-6 p-6 w-full rounded-t-lg relative overflow-hidden",
  profileImage: "w-32 h-32 rounded-full border-4 border-white/80 shadow-lg shadow-blue-700/30 object-cover transition-all duration-300 hover:scale-105",
  rankDisplay: "flex justify-center items-center py-2 text-black bg-no-repeat bg-center transition-transform duration-300 hover:scale-105",
  scoreCard: "relative w-full sm:w-5/6 flex justify-between items-center py-3 px-5 rounded-xl text-white overflow-hidden bg-center bg-no-repeat bg-cover ring-2 ring-blue-400/50 shadow-xl hover:ring-blue-400 transition-all duration-300",
  shineEffect: "absolute top-0 left-[-75%] w-[80%] h-full bg-white/20 rotate-[25deg] animate-shine",
  challengeButton: "w-full sm:w-auto py-3 px-8 rounded-xl text-white font-semibold flex items-center justify-center gap-x-3 shadow-lg shadow-blue-600/40 hover:shadow-blue-600/70 transition duration-300 ease-in-out hover:scale-105 bg-no-repeat transform active:scale-95 active:shadow-inner"
};

const calculateProgress = (completedActivities, completedLessons, expectedActivities, expectedLessons) => {
  const total = expectedActivities.length + expectedLessons.length;
  const completed = expectedActivities.filter(a => completedActivities.includes(a)).length +
    expectedLessons.filter(l => completedLessons.includes(l)).length;
  return total === 0 ? 0 : Math.round((completed / total) * 100);
};

const sampleScores = [
  { player1: 'Bretana', score1: 1000, player2: 'Vicentuan', score2: 59 },
  { player1: 'Bretana', score1: 960, player2: 'Ramirez', score2: 52 },
  { player1: 'Bretana', score1: 920, player2: 'Aquino', score2: 50 },
];

const RankStats = () => {
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userSection, setUserSection] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(0); // index of weeks array
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setmatches] = useState([]);
  const [battleLoading, setBattleLoading] = useState(true);
  const [battleError, setBattleError] = useState(null);
  const auth = getAuth();
  const location = useLocation();

  // Set selectedWeek based on URL
  useEffect(() => {
    const match = location.pathname.match(/week(\d+)/i);
    if (match) {
      const weekNum = parseInt(match[1], 10);
      if (!isNaN(weekNum) && weekNum > 0 && weekNum <= weeks.length) {
        setSelectedWeek(weekNum - 1); // 0-indexed
      }
    }
  }, [location.pathname]);

  // Fetch userId
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user info and progress for selected week
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      if (!userId) return;
      try {
        const userRef = doc(db, 'users', userId);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.data();
          setUserName(userData.name || '');
          setUserSection(userData.section || '');
          const completedActivities = userData.completedActivities || [];
          const completedLessons = userData.completedLessons || [];
          const week = weeks[selectedWeek];
          const percentage = calculateProgress(
            completedActivities,
            completedLessons,
            week.expectedActivities,
            week.expectedLessons
          );
          setProgress(percentage);
        }
      } catch (error) {
        setProgress(0);
        setUserName('');
        setUserSection('');
      } finally {
        setIsLoading(false);
      }
    };
    if (!authLoading) fetchUserData();
  }, [userId, authLoading, selectedWeek]);

  // Fetch battle records from Firestore
  useEffect(() => {
    const fetchBattleRecords = async () => {
      if (!userId) return;
      
      setBattleLoading(true);
      setBattleError(null);
      
      try {
        // First try to fetch matches using simpler queries without complex ordering
        // This may work even without composite indexes
        let allMatches = [];
        
        try {
          // Query for matches where the user was player1 - without ordering by timestamp first
          const player1Query = query(
            collection(db, 'matches'),
            where('player1Id', '==', userId)
          );
          
          // Query for matches where the user was player2 - without ordering by timestamp first
          const player2Query = query(
            collection(db, 'matches'),
            where('player2Id', '==', userId)
          );
          
          const [player1Snapshot, player2Snapshot] = await Promise.all([
            getDocs(player1Query),
            getDocs(player2Query)
          ]);
          
          player1Snapshot.forEach(doc => {
            allMatches.push({
              id: doc.id,
              isPlayer1: true,
              ...doc.data()
            });
          });
          
          player2Snapshot.forEach(doc => {
            allMatches.push({
              id: doc.id,
              isPlayer1: false,
              ...doc.data()
            });
          });
          
          // Sort manually in JavaScript
          allMatches.sort((a, b) => {
            const dateA = a.timestamp?.toDate?.() || new Date(0);
            const dateB = b.timestamp?.toDate?.() || new Date(0);
            return dateB - dateA;
          });
          
          console.log("Fetched matches using simple queries:", allMatches.length);
        } catch (error) {
          console.error("Error with simple query, falling back to sample data:", error);
          throw error; // Rethrow to be caught by outer catch block
        }
        
        // Take only the most recent matches
        allMatches = allMatches.slice(0, 3);
        
        if (allMatches.length === 0) {
          console.log("No matches found for user:", userId);
          setmatches([]);
          return;
        }
        
        // Get opponent names for each battle
        const opponentPromises = allMatches.map(async match => {
          try {
            const opponentId = match.isPlayer1 ? match.player2Id : match.player1Id;
            
            if (!opponentId) {
              return {
                ...match,
                opponentName: 'Unknown Player',
                timeAgo: calculateTimeAgo(match.timestamp?.toDate())
              };
            }
            
            const opponentRef = doc(db, 'users', opponentId);
            const opponentSnap = await getDoc(opponentRef);
            
            return {
              ...match,
              opponentName: opponentSnap.exists() ? opponentSnap.data().name : 'Unknown Player',
              timeAgo: calculateTimeAgo(match.timestamp?.toDate())
            };
          } catch (error) {
            console.error("Error getting opponent info:", error);
            return {
              ...match,
              opponentName: 'Unknown Player',
              timeAgo: calculateTimeAgo(match.timestamp?.toDate())
            };
          }
        });
        
        const matchesWithOpponents = await Promise.all(opponentPromises);
        console.log("Matches with opponent data:", matchesWithOpponents);
        setmatches(matchesWithOpponents);
      } catch (error) {
        console.error("Error fetching match records:", error);
        
        // Check if error is related to missing index
        const isIndexError = error.message?.includes('requires an index');
        
        if (isIndexError) {
          const indexUrl = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
          setBattleError(
            <div className="flex flex-col items-center">
              <p>Database index required</p>
              <p className="mt-1 text-sm">
                {indexUrl ? (
                  <>
                    An administrator needs to create a database index.
                    <a 
                      href={indexUrl[0]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block mt-2 text-blue-400 underline hover:text-blue-300"
                    >
                      Create Index
                    </a>
                  </>
                ) : (
                  "Please contact your administrator about creating a Firestore index."
                )}
              </p>
            </div>
          );
        } else {
          setBattleError("Failed to load recent matches");
        }
        
        // Use sample data as fallback
        setmatches(sampleScores.map((score, index) => ({
          id: `sample-${index}`,
          player1Id: userId,
          player2Id: 'sample',
          player1Name: userName || 'You',
          opponentName: score.player2,
          score1: score.score1,
          score2: score.score2,
          isPlayer1: true,
          timeAgo: index === 0 ? 'Just now' : index === 1 ? '2h ago' : '1d ago'
        })));
      } finally {
        setBattleLoading(false);
      }
    };
    
    if (!authLoading && userId) {
      fetchBattleRecords();
    }
  }, [userId, authLoading, userName]);
  
  // Helper function to calculate time ago
  const calculateTimeAgo = (date) => {
    if (!date) return 'Unknown time';
    
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHr = Math.round(diffMin / 60);
    const diffDays = Math.round(diffHr / 24);
    
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };
  
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/CodeChallengeLobby');
  };

  return (
    <div 
      className={styles.container} 
      style={{ 
        backgroundColor: '#1A2455',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}
    >
      {/* Profile Header Section with improved design */}
      <div 
        className={styles.header} 
        style={{ 
          backgroundImage: 'linear-gradient(135deg, #445BC1 0%, #2A3A8C 100%)',
          boxShadow: 'inset 0 -10px 20px -10px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-5 left-5 w-20 h-20 rounded-full bg-white/30"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white/20"></div>
          <div className="absolute top-20 right-20 w-16 h-16 rounded-full bg-white/20"></div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-600/30 blur-md transform scale-110"></div>
          <img
            src={ProfileIcon}
            alt="Profile Avatar"
            className={styles.profileImage}
          />
        </div>

        <div className="flex flex-col flex-1 z-10">
          <div>
            <div className="flex items-end gap-2">
              <h1 className="text-3xl sm:text-4xl font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] animate-fadeIn">
                {isLoading ? 
                  <div className="h-9 w-40 bg-white/20 animate-pulse rounded"></div> : 
                  userName || 'Student'}
              </h1>
              <div className="mb-1 px-2 py-0.5 bg-blue-700/50 rounded-lg text-xs font-medium">Student</div>
            </div>

            <p className="text-xl sm:text-2xl font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-blue-200 mb-2">
              {isLoading ? 
                <div className="h-6 w-28 bg-white/20 animate-pulse rounded mt-1"></div> : 
                userSection || 'Section'}
            </p>

            {/* Dynamic Topic with improved styling */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
              <p className="text-sm text-blue-100">{weeks[selectedWeek].topic}</p>
            </div>

            {/* Progress Bar with improved visual design */}
            <div className="flex items-center w-full mt-2 mb-4">
              <div className="flex-1 bg-gray-800/50 h-3 rounded-full relative overflow-hidden ring-1 ring-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out
                    ${progress === 100 ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                  style={{ width: `${progress}%` }}
                >
                  {/* Animated stripe pattern for progress bar */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div 
                      className="absolute inset-0 opacity-20" 
                      style={{
                        backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent)',
                        backgroundSize: '20px 20px',
                        animation: 'progress-bar-stripes 1s linear infinite'
                      }}
                    ></div>
                  </div>
                </div>
                {progress > 15 && (
                  <div 
                    className="absolute top-1/2 transform -translate-y-1/2 text-[10px] font-bold text-white drop-shadow-md transition-all duration-500"
                    style={{ left: `${Math.min(Math.max(progress - 5, 5), 90)}%` }}
                  >
                    {progress}%
                  </div>
                )}
              </div>
              {progress <= 15 && (
                <div className="ml-2 text-xs text-white/90 w-10 text-right font-medium">{progress}%</div>
              )}
            </div>
          </div>

          {/* Rank Display Section with improved layout */}
          <div className="grid grid-cols-2 gap-3 text-center">
            {/* Current Rank */}
            <div>
              <p className="text-sm font-medium text-blue-200 mb-1">Current Rank</p>
              <div
                className={styles.rankDisplay}
                style={{
                  backgroundImage: `url(${StatsIcon})`,
                  backgroundSize: 'contain'
                }}
              >
                <p className="text-lg font-bold flex items-center gap-x-1 mb-1">
                  <img src={FireIcon} alt="fire" className="w-5 h-5" /> 3000
                </p>
              </div>
            </div>

            {/* Highest Rank */}
            <div>
              <p className="text-sm font-medium text-blue-200 mb-1">Highest Rank</p>
              <div
                className={styles.rankDisplay}
                style={{
                  backgroundImage: `url(${StatsIcon})`,
                  backgroundSize: 'contain'
                }}
              >
                <p className="text-lg font-bold flex items-center gap-x-1 mb-1">
                  <img src={FireIcon} alt="fire" className="w-5 h-5" /> 10000
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Best Scores Section with improved layout */}
      <div className="p-6 pt-8 pb-6">
        <h2 className="text-2xl font-bold mb-5 flex items-center gap-2 before:content-[''] before:block before:w-1.5 before:h-6 before:bg-blue-500 before:rounded">
          Recent matches
          {battleLoading && <div className="ml-3 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
        </h2>
        
        {battleLoading ? (
          <div className="flex flex-col gap-3 items-center">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-5/6 h-16 bg-gray-800/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : battleError ? (
          <div className="text-center py-6 text-red-300">
            {typeof battleError === 'string' ? <p>{battleError}</p> : battleError}
            <button 
              onClick={() => setBattleLoading(true)} // This will trigger a refetch
              className="mt-2 text-sm underline text-blue-300 hover:text-blue-200"
            >
              Try again
            </button>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border border-dashed border-gray-700 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mb-1">No match history found</p>
            <p className="text-sm">Challenge another student to start competing</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {matches.map((battle, index) => {
              const userScore = battle.isPlayer1 ? battle.score1 : battle.score2;
              const opponentScore = battle.isPlayer1 ? battle.score2 : battle.score1;
              const userWon = userScore > opponentScore;
              
              return (
                <div
                  key={battle.id}
                  className={styles.scoreCard}
                  style={{ backgroundImage: `url(${ChallengeIcon})` }}
                >
                  <div className={styles.shineEffect} />
                  
                  {/* Left Player (User) */}
                  <div className="z-10 text-left flex flex-col">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <p className="font-bold text-lg text-blue-200 drop-shadow">You</p>
                    </div>
                    <p className="flex items-center gap-1 text-base pl-4">
                      <img src={FireIcon} alt="fire" className="w-6 h-6" />
                      <span className="font-mono font-semibold">{userScore}</span>
                    </p>
                  </div>
                  
                  {/* Battle Indicator */}
                  <div className="z-10 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="text-sm font-bold bg-indigo-900/70 px-2 py-1 rounded-lg mb-1 text-blue-200">VS</div>
                    <div className="text-[10px] bg-gray-800/70 px-1.5 py-0.5 rounded text-gray-400">
                      {battle.timeAgo}
                    </div>
                  </div>
                  
                  {/* Right Player (Opponent) */}
                  <div className="z-10 text-right flex flex-col items-end">
                    <div className="flex items-center gap-2 justify-end">
                      <p className="font-bold text-lg text-red-200 drop-shadow">{battle.opponentName}</p>
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    </div>
                    <p className="flex items-center gap-1 justify-end text-base pr-4">
                      <span className="font-mono font-semibold">{opponentScore}</span>
                      <img src={FireIcon} alt="fire" className="w-6 h-6" />
                    </p>
                  </div>
                  
                  {/* Winner indicator */}
                  {userWon && (
                    <div className="absolute top-0 left-0 bg-green-500/20 border-l-4 border-green-500 h-full w-1/2 -z-10 rounded-l-xl"></div>
                  )}
                  {userScore < opponentScore && (
                    <div className="absolute top-0 right-0 bg-red-500/20 border-r-4 border-red-500 h-full w-1/2 -z-10 rounded-r-xl"></div>
                  )}
                  {userScore === opponentScore && (
                    <div className="absolute top-0 left-0 bg-yellow-500/10 border-x-4 border-yellow-500/40 h-full w-full -z-10 rounded-xl"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Challenge Button with improved styling */}
        <div className="flex justify-center items-center mt-8">
          <button
            className={styles.challengeButton}
            style={{
              backgroundImage: `url(${ButtonBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onClick={handleClick}
            disabled={isLoading || battleLoading}
          >
            {/* Using Lucide React Swords icon */}
            <Swords className="h-5 w-5" />
            Find Match
          </button>
        </div>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes progress-bar-stripes {
          from { background-position: 20px 0; }
          to { background-position: 0 0; }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(25deg); }
          100% { transform: translateX(100%) rotate(25deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-shine {
          animation: shine 3s infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default RankStats;
