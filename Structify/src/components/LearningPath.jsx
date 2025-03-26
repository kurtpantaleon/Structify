import React from 'react';
import { Link } from 'react-router-dom'; // Use Link for navigation

function LearningPath({ isOpen, toggleLearningPath }) {
  // Weeks data without actual progress, just placeholders
  const weeks = [
    { week: "", topic: "Introduction to Data Structures", path: "/mainPage" },
    { week: "", topic: "Algorithms & Complexity", path: "/week2Page" },
    { week: "", topic: "String Processing", path: "/week3Page" },
    { week: "", topic: "Array, Records, and Pointers", path: "/week4Page" },
    { week: "", topic: "Linked Lists", path: "/week5Page" },
    { week: "", topic: "Stacks, Queues, and Recursion", path: "/week6Page" },
    { week: "", topic: "Trees", path: "/week7Page" },
    { week: "", topic: "Graph Algorithms", path: "/week8Page" },
    { week: "", topic: "Sorting and Searching", path: "/week9Page" },
    { week: "", topic: "Hashing", path: "/week10Page" },
  ];

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[450px] bg-[#1F274D] text-white border-l border-white/20 p-5 z-50 shadow-lg
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
      {/* Close Button */}
      <button
        onClick={toggleLearningPath}
        className="absolute top-1 left-1 text-white  p-1"
      >
        <span className="text-4xl">&times;</span> {/* Close Icon */}
      </button>

      <div className="ml-5 flex items-center justify-between  mb-2">
        <h2 className="font-bold text-lg">Learning Path</h2>
        <p className="text-xs">0/17</p>
      </div>

      <div className="w-full bg-gray-700 h-2 rounded-full relative mb-4">
        <div className="bg-white h-2 rounded-full w-1/5"></div>
      </div>

      {/* List of Weeks - Scrollable content */}
      <div className=" overflow-y-auto  max-h-[calc(100vh-80px)]">
        {weeks.map((item, index) => (
          <Link key={index} to={item.path}>
            <div
              className="w-full px-3 py-3 bg-[#020B4A] rounded-lg border border-white/40 text-center cursor-pointer mb-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-md">{item.week}</span>
                <span className="text-xs text-gray-400">--</span> {/* Placeholder for progress */}
              </div>
              <p className="text-sm">{item.topic}</p>

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
