import React from 'react';
import { Link } from 'react-router-dom';

function LearningPath({ isOpen, toggleLearningPath }) {
  // Weeks data without actual progress, just placeholders
  const weeks = [
    { week: "", topic: "Introduction to Data Structures", path: "/mainPage" },
    { week: "", topic: "Algorithms & Complexity", path: "/week2Page" },
    { week: "", topic: "String Processing", path: "/week3Page" },
    { week: "", topic: "Array, Records, and Pointers", path: "/week4Page" },
    { week: "", topic: "Linked Lists", path: "/week6Page" },
    { week: "", topic: "Stacks, Queues, and Recursion", path: "/week7Page" },
    { week: "", topic: "Trees", path: "/week10Page" },
    { week: "", topic: "Graph Algorithms", path: " "},
    { week: "", topic: "Sorting and Searching", path: "" },
    { week: "", topic: "Hashing", path: "" },
  ];

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-[#1F274D] text-white border-l border-white/20 z-50 shadow-lg
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        w-full sm:w-80 md:w-96 lg:w-[450px] p-4 sm:p-5`}
    >
      {/* Close Button */}
      <button
        onClick={toggleLearningPath}
        className="absolute top-3 left-3 text-white p-2 rounded-full hover:bg-gray-700 focus:ring-2 focus:ring-white"
        aria-label="Close Learning Path"
      >
        <span className="text-2xl sm:text-3xl">×</span>
      </button>

      <div className="ml-10 sm:ml-12 flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="font-bold text-base sm:text-lg md:text-xl">Learning Path</h2>
        <p className="text-[10px] sm:text-xs">0/17</p>
      </div>

      <div className="w-full bg-gray-700 h-2 rounded-full relative mb-4 sm:mb-6">
        <div className="bg-white h-2 rounded-full w-1/5"></div>
      </div>

      {/* List of Weeks - Scrollable content */}
      <div className="overflow-y-auto max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-140px)]">
        {weeks.map((item, index) => (
          <Link key={index} to={item.path} className="block">
            <div
              className="w-full px-3 py-2 sm:py-3 bg-[#020B4A] rounded-lg border border-white/40 text-center cursor-pointer mb-2 hover:bg-gray-700"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm sm:text-base">{item.week}</span>
                <span className="text-[10px] sm:text-xs text-gray-400">--</span>
              </div>
              <p className="text-xs sm:text-sm mt-1">{item.topic}</p>

              {/* Placeholder for Progress */}
              <div className="w-full bg-gray-500 h-1 mt-2 rounded-full">
                <div
                  className="bg-gray-700 h-1 rounded-full"
                  style={{ width: `100%` }} // Placeholder width, will be handled by backend
                ></div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default LearningPath;