import React, { useEffect, useState } from 'react';
import ProfileIcon from '../assets/images/sample profile.png';
import StatsIcon from '../assets/images/stats.png';
import FireIcon from '../assets/images/fire.png';
import ChallengeIcon from '../assets/images/challngeBg.png';
import ButtonBg from '../assets/images/buttonBg.png';
import { getDoc, doc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../services/firebaseConfig';
import { useLocation } from 'react-router-dom';

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
  container: "w-2xl mx-auto text-white rounded-2xl shadow-xl",
  header: "flex justify-center items-center flex-row w-full rounded-t-lg h-60",
  profileImage: "w-42 h-40 rounded-full border-4 border-white",
  rankDisplay: "flex justify-center items-center py-2 text-black bg-no-repeat bg-center",
  scoreCard: "relative w-150 flex justify-evenly items-center py-2 px-4 rounded-xl text-white overflow-hidden bg-center bg-no-repeat bg-cover ring-2 ring-blue-400 shadow-xl",
  shineEffect: "absolute top-0 left-[-75%] w-[80%] h-full bg-white/20 rotate-[25deg] animate-shine",
  challengeButton: "w-90 py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-x-2 shadow-lg shadow-blue-600/40 hover:shadow-blue-600/70 transition duration-300 ease-in-out hover:scale-105 bg-no-repeat"
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
      }
    };
    if (!authLoading) fetchUserData();
  }, [userId, authLoading, selectedWeek]);

  return (
    <div className={styles.container} style={{ backgroundColor: '#1A2455' }}>
      {/* Profile Header Section */}
      <div className={styles.header} style={{ backgroundColor: '#445BC1' }}>
        <img
          src={ProfileIcon}
          alt="Profile Avatar"
          className={styles.profileImage}
        />
        <div className="flex flex-col ml-10">
          <div>
            <h1 className="text-4xl font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{userName || ' '}</h1>
            <p className="text-2xl font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{userSection || ' '}</p>
            {/* Dynamic Topic */}
            <p className="text-xs text-blue-200 mt-2">{weeks[selectedWeek].topic}</p>
            {/* Progress Bar for Selected Week */}
            <div className="flex items-center w-full mt-2">
              <div className="flex-1 bg-gray-700 h-2 rounded-full relative">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${progress === 100 ? 'bg-green-500' : 'bg-yellow-400'}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="ml-2 text-xs text-white/70 w-10 text-right">{progress}%</div>
            </div>
          </div>

          {/* Rank Display Section */}
          <div className="grid grid-cols-2 gap-2 text-center">
            {/* Current Rank */}
            <div className="mt-3">
              <p className="text-md font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Current Rank</p>
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
            <div className="mt-3">
              <p className="text-md font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Highest Rank</p>
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

      {/* Best Scores Section */}
      <h2 className="mt-6 text-2xl font-bold text-center">My Best Scores</h2>
      <div className="flex flex-col justify-center items-center gap-4 mt-6">
        {sampleScores.map((score, index) => (
          <div
            key={index}
            className={styles.scoreCard}
            style={{ backgroundImage: `url(${ChallengeIcon})` }}
          >
            <div className={styles.shineEffect} />
            {/* Left Player */}
            <div className="z-10 text-left">
              <p className="font-bold text-xl text-blue-200 drop-shadow">{score.player1}</p>
              <p className="flex items-center gap-1 text-base">
                <img src={FireIcon} alt="fire" className="w-6 h-6" />
                {score.score1}
              </p>
            </div>
            {/* Right Player */}
            <div className="z-10 text-right">
              <p className="font-bold text-xl text-red-200 drop-shadow">{score.player2}</p>
              <p className="flex items-center gap-1 text-base">
                <img src={FireIcon} alt="fire" className="w-6 h-6" />
                {score.score2}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Challenge Button */}
      <div className="flex justify-center items-center p-3 mt-2">
        <button
          className={styles.challengeButton}
          style={{
            backgroundImage: `url(${ButtonBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          Find Match
        </button>
      </div>
    </div>
  );
};

export default RankStats;
