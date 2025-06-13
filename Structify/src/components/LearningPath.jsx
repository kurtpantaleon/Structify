import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../services/firebaseConfig';

function LearningPath({ isOpen, toggleLearningPath }) {
  const [progress, setProgress] = useState({});
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(null);
 
  // Initialize Firebase Auth
  const auth = getAuth();

  // Define the structure for each week's expected activities and lessons
  const weeks = [
    {
      week: "Week 1",
      topic: "Introduction to Data Structures",
      path: "/mainPage",
      expectedActivities: ["activity1", "activity2", "activity3"],
      expectedLessons: ["lesson1", "lesson2", "lesson3"],
      description: "Learn the fundamentals of data structures and their importance in computer science."
    },
    {
      week: "Week 2",
      topic: "Algorithms & Complexity",
      path: "/week2Page",
      expectedActivities: ["Week2activity1", "Week2activity2", "Week2activity3"],
      expectedLessons: ["Week2lesson1", "Week2lesson2", "Week2lesson3"],
      description: "Explore algorithm analysis and computational complexity theory."
    },
    { 
      week: "Week 3",
      topic: "String Processing",
      path: "/week3Page",
      expectedActivities: ['Week3activity1', 'Week3activity2', 'Week3activity3'],
      expectedLessons: ['Week3lesson1', 'Week3lesson2', 'Week3lesson3'],
      description: "Master string manipulation and processing techniques."
    },
    {
      week: "Week 4 and 5",
      topic: "Array, Records, and Pointers",
      path: "/week4Page",
      expectedActivities: ['Week4activity1', 'Week4activity2', 'Week4activity3'],
      expectedLessons: ['Week4lesson1', 'Week4lesson2', 'Week4lesson3'],
      description: "Understand arrays, records, and pointers in-depth."
    },
    {
      week: "Week 6",
      topic: "Linked Lists",
      path: "/week6Page",
      expectedActivities: ['Week6activity1', 'Week6activity2', 'Week6activity3'],
      expectedLessons: ['Week6lesson1', 'Week6lesson2', 'Week6lesson3'],
      description: "Learn about linked lists and their applications."
    },
    { 
      week: "Week 7 and 8",
      topic: "Stacks, Queues, and Recursion",
      path: "/week7Page",
      expectedActivities: ['Week7activity1', 'Week7activity2', 'Week7activity3'],
      expectedLessons: ['Week7lesson1', 'Week7lesson2', 'Week7lesson3'],
      description: "Dive into stacks, queues, and recursion techniques."
    },
    {
      week: "Week 10 and 11",
      topic: "Trees",
      path: "/week10Page",
      expectedActivities: ['Week10activity1', 'Week10activity2', 'Week10activity3'],
      expectedLessons: ['Week10lesson1', 'Week10lesson2', 'Week10lesson3'],
      description: "Explore tree data structures and their algorithms."
    },
    {
      week: "Week 12 and 13",
      topic: "Graph Algorithms",
      path: " ",
      expectedActivities: [],
      expectedLessons: [],
      description: "Introduction to graph algorithms and their use cases."
    },
    {
      week: "Week 14 and 16",
      topic: "Sorting and Searching",
      path: "",
      expectedActivities: [],
      expectedLessons: [],
      description: "Learn various sorting and searching algorithms."
    },
    {
      week: "Week 17",
      topic: "Hashing",
      path: "",
      expectedActivities: [],
      expectedLessons: [],
      description: "Understand hashing techniques and their applications."
    }
  ];

  const calculateProgress = (completedActivities, completedLessons, expectedActivities, expectedLessons) => {
    const total = expectedActivities.length + expectedLessons.length;
    const completed = expectedActivities.filter(a => completedActivities.includes(a)).length +
                      expectedLessons.filter(l => completedLessons.includes(l)).length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  // Fetch the userId using Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        console.log("Authenticated userId:", user.uid);
      } else {
        setUserId(null);
        console.log("No user authenticated");
      }
      setAuthLoading(false); // Auth state resolved
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  // Fetch user progress once userId is available
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!userId) {
        console.log("No userId available, skipping fetch");
        return;
      }

      console.log("Fetching progress for userId:", userId);
      try {
        const userRef = doc(db, 'users', userId);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.data();
          console.log("User data fetched:", userData);
          const completedActivities = userData.completedActivities || [];
          const completedLessons = userData.completedLessons || [];
          console.log("Completed Activities:", completedActivities);
          console.log("Completed Lessons:", completedLessons);

          const progressData = {};

          weeks.forEach((week, index) => {
            const weekKey = `week${index + 1}`;
            const percentage = calculateProgress(
              completedActivities,
              completedLessons,
              week.expectedActivities,
              week.expectedLessons
            );
            console.log(`Progress for ${weekKey}: ${percentage}%`);
            progressData[weekKey] = {
              progress: percentage,
              completed: percentage === 100
            };
          });

          setProgress(progressData);
          console.log("Updated progress state:", progressData);
        } else {
          console.log("No user data found for userId:", userId);
        }
      } catch (error) {
        console.error("Error fetching user progress:", error);
      }
    };

    if (!authLoading) {
      fetchUserProgress();
    }
  }, [userId, authLoading]);

  // Handler for expanding week details
  const toggleWeekDetails = (index) => {
    if (activeWeek === index) {
      setActiveWeek(null);
    } else {
      setActiveWeek(index);
    }
  };

  // Display a loading message or redirect to login if user is not authenticated
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#1F274D] text-white p-8">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium">Loading your learning journey...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#1F274D] text-white p-8 space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Sign in Required</h3>
          <p className="text-gray-300">Please log in to view your progress and continue your learning journey.</p>
        </div>
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 font-medium">
          Sign In
        </button>
      </div>
    );
  }

  const completedWeeks = Object.values(progress).filter(p => p.completed).length;
  const totalWeeks = weeks.length;
  const progressPercentage = Math.round((completedWeeks / totalWeeks) * 100);

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-gradient-to-b from-[#1F274D] to-[#141a35] text-white border-l border-white/20 z-50 shadow-xl
        transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        w-full sm:w-80 md:w-96 lg:w-[450px]`}
    >
      {/* Header with improved styling */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-[#1a2142] to-[#232d5d] px-4 py-5 shadow-md">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleLearningPath}
            className="text-white p-2 rounded-full hover:bg-indigo-600/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            aria-label="Close Learning Path"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <h2 className="text-lg md:text-xl font-bold tracking-wide text-center">Your Learning Journey</h2>
          <div className="w-8"></div> {/* Spacer for centering */}
        </div>
        
        {/* Improved progress visualization */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-indigo-200 font-medium">Overall Progress</span>
            <span className="text-xs font-bold bg-indigo-900/50 px-2 py-0.5 rounded-full">
              {completedWeeks}/{totalWeeks} Weeks
            </span>
          </div>
          
          <div className="w-full h-3 bg-gray-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="h-full w-full opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InN0cmlwZXMiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjUiIGhlaWdodD0iMTAiIGZpbGw9IiNmZmZmZmYyMCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjc3RyaXBlcykiLz48L3N2Zz4=')]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content with improved week cards */}
      <div className="overflow-y-auto hide-scrollbar h-[calc(100vh-120px)] px-4 py-3 space-y-3">
        {weeks.map((item, index) => {
          const key = `week${index + 1}`;
          const prog = progress[key]?.progress || 0;
          const isCompleted = progress[key]?.completed || false;
          const isActive = activeWeek === index;
          
          // Comment out the locking logic
          // Determine if this week is available or locked
          // const isPrevCompleted = index === 0 || progress[`week${index}`]?.progress > 0;
          // const isAvailable = index === 0 || isPrevCompleted;
          
          // Make all weeks available
          const isAvailable = true;

          return (
            <div 
              key={index}
              className={`w-full rounded-xl transition-all duration-300 overflow-hidden
                ${isCompleted ? 'bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30' : 
                  'bg-gradient-to-r from-indigo-900/30 to-blue-900/20 border border-blue-500/30'}
                ${isActive ? 'shadow-lg shadow-blue-500/10' : 'shadow-md'}
              `}
            >
              {/* Week header - clickable to expand - removed availability check */}
              <div 
                className="px-4 py-3 cursor-pointer"
                onClick={() => toggleWeekDetails(index)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    {/* Week indicator - removed conditional styling based on availability */}
                    <div className={`relative w-10 h-10 flex items-center justify-center rounded-full 
                      ${isCompleted ? 'bg-green-500/20' : 'bg-blue-500/20'}`}
                    >
                      <span className="text-xs font-bold">{index + 1}</span>
                      {isCompleted && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    
                    {/* Week title and topic - removed conditional text color based on availability */}
                    <div>
                      <h3 className={`font-semibold ${isCompleted ? 'text-green-300' : 'text-white'}`}>
                        {item.week}
                      </h3>
                      <p className="text-xs text-gray-300">{item.topic}</p>
                    </div>
                  </div>
                  
                  {/* Progress percentage and dropdown indicator */}
                  <div className="flex items-center">
                    <span className={`text-xs mr-2 font-medium ${isCompleted ? 'text-green-300' : 'text-blue-300'}`}>
                      {prog}%
                    </span>
                    {isAvailable && (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-4 w-4 transition-transform duration-300 ${isActive ? 'transform rotate-180' : ''}`} 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-1 mt-3 bg-gray-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-gradient-to-r from-green-400 to-blue-500' : 
                      'bg-gradient-to-r from-blue-400 to-indigo-500'}`}
                    style={{ width: `${prog}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Expanded content */}
              {isActive && (
                <div className="px-4 pb-4 pt-1 animate-fadeIn">
                  {/* Description */}
                  <p className="text-sm text-gray-300 mb-3">{item.description || "Explore the topics and activities for this week."}</p>
                  
                  {/* Content overview */}
                  <div className="bg-black/20 rounded-lg p-3 mb-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-gray-400">Lessons: {item.expectedLessons.length}</span>
                      <span className="text-xs text-gray-400">Activities: {item.expectedActivities.length}</span>
                    </div>
                  </div>
                  
                  {/* Action button */}
                  <Link 
                    to={item.path} 
                    className={`w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200
                      ${isCompleted ? 
                        'bg-green-600 hover:bg-green-700 text-white' : 
                        'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    onClick={toggleLearningPath}
                  >
                    <span className="font-medium text-sm">
                      {isCompleted ? "Review Content" : prog > 0 ? "Continue Learning" : "Start Learning"}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              )}
              
              {/* Comment out the locked indicator for unavailable weeks */}
              {/* {!isAvailable && (
                <div className="px-4 pb-3">
                  <div className="flex items-center justify-center text-gray-500 text-xs py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Complete previous week to unlock
                  </div>
                </div>
              )} */}
            </div>
          );
        })}
        
        {/* Add some bottom padding */}
        <div className="h-6"></div>
      </div>
      
      {/* Custom scrollbar styling */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .hide-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        
        .hide-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
        
        .hide-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default LearningPath;