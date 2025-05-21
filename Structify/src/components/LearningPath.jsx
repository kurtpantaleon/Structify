import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import Firebase Auth
import { db } from '../services/firebaseConfig'; // Adjust the path to your Firebase config

function LearningPath({ isOpen, toggleLearningPath }) {
  const [progress, setProgress] = useState({});
  const [userId, setUserId] = useState(null); // State to store the authenticated userId
  const [authLoading, setAuthLoading] = useState(true); // State to handle auth loading
 
  // Initialize Firebase Auth
  const auth = getAuth();

  // Define the structure for each week's expected activities and lessons
  const weeks = [
    {
      week: "Week 1",
      topic: "Introduction to Data Structures",
      path: "/mainPage",
      expectedActivities: ["activity1", "activity2", "activity3"],
      expectedLessons: ["lesson1", "lesson2", "lesson3"]
    },
    {
      week: "Week 2",
      topic: "Algorithms & Complexity",
      path: "/week2Page",
      expectedActivities: ["Week2activity1", "Week2activity2", "Week2activity3"],
      expectedLessons: ["Week2lesson1", "Week2lesson2", "Week2lesson3"]
    },
    {
      week: "Week 3",
      topic: "String Processing",
      path: "/week3Page",
      expectedActivities: ['Week3activity1', 'Week3activity2', 'Week3activity3'],
      expectedLessons: ['Week3lesson1', 'Week3lesson2', 'Week3lesson3']
    },
    {
      week: "Week 4 and 5",
      topic: "Array, Records, and Pointers",
      path: "/week4Page",
      expectedActivities: ['Week4activity1', 'Week4activity2', 'Week4activity3'],
      expectedLessons: ['Week4lesson1', 'Week4lesson2', 'Week4lesson3']
    },
    {
      week: "Week 6",
      topic: "Linked Lists",
      path: "/week6Page",
      expectedActivities: ['Week6activity1', 'Week6activity2', 'Week6activity3'],
      expectedLessons: ['Week6lesson1', 'Week6lesson2', 'Week6lesson3']
    },
    { 
      week: "Week 7 and 8",
      topic: "Stacks, Queues, and Recursion",
      path: "/week7Page",
      expectedActivities: ['Week7activity1', 'Week7activity2', 'Week7activity3'],
      expectedLessons: ['Week7lesson1', 'Week7lesson2', 'Week7lesson3']
    },
    {
      week: "Week 10 and 11",
      topic: "Trees",
      path: "/week10Page",
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

  // Display a loading message or redirect to login if user is not authenticated
  if (authLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!userId) {
    return <div className="text-white p-4">Please log in to view your progress.</div>;
  }

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-[#1F274D] text-white border-l border-white/20 z-50 shadow-lg
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        w-full sm:w-80 md:w-96 lg:w-[450px] p-4 sm:p-5`}
    >
      <button
        onClick={toggleLearningPath}
        className="absolute top-3 left-3 text-white p-2 rounded-full hover:bg-gray-700 focus:ring-2 focus:ring-white"
        aria-label="Close Learning Path"
      >
        <span className="text-2xl sm:text-3xl">×</span>
      </button>

      <div className="ml-10 sm:ml-12 flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="font-bold text-base sm:text-lg md:text-xl">Weekly Course Outline</h2>
        <p className="text-[10px] sm:text-xs">{
          Object.values(progress).filter(p => p.completed).length
        }/{weeks.length}</p>
      </div>

      <div className="w-full bg-gray-700 h-2 rounded-full relative mb-4 sm:mb-6">
        <div
          className="bg-white h-2 rounded-full"
          style={{
            width: `${(Object.values(progress).filter(p => p.completed).length / weeks.length) * 100}%`
          }}
        ></div>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-140px)]">
        {weeks.map((item, index) => {
          const key = `week${index + 1}`;
          const prog = progress[key]?.progress || 0;
          const isCompleted = progress[key]?.completed || false;

          return (
            <Link key={index} to={item.path} className="block">
              <div className="w-full px-3 py-2 sm:py-3 bg-[#020B4A] rounded-lg border border-white/40 text-center cursor-pointer mb-2 hover:bg-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm sm:text-base">{item.week}</span>
                  <span className="text-[10px] sm:text-xs text-gray-400">{prog}%</span>
                </div>
                <p className="text-xs sm:text-sm mt-1">{item.topic}</p>
                <div className="w-full bg-gray-500 h-1 mt-2 rounded-full">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-yellow-400'}`}
                    style={{ width: `${prog}%` }}
                  ></div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default LearningPath;