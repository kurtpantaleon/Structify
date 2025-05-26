import React from 'react';
import { useNavigate } from 'react-router-dom';
import XIcon from '../assets/images/X Icon.png';
import InfoIcon from '../assets/images/Information Icon.png';

function SubHeading2({ progress = 1, totalSteps = 8, onNext, onPrev, exitPath = '/mainPage' }) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#1F274D] flex items-center justify-between px-4 sm:px-6 md:px-8 py-2 sm:py-3 shadow-md border-b border-white/10">
      {/* Exit button */}
      <button
        onClick={() => navigate(exitPath)}
        className="p-2 sm:p-3 rounded-full hover:bg-gray-700 focus:ring-2 focus:ring-white transition-transform transform hover:scale-105"
        aria-label="Exit Lesson"
      >
        <img
          src={XIcon}
          alt="Exit Icon"
          className="h-5 w-5 sm:h-6 sm:w-6 cursor-pointer"
        />
      </button>

      {/* Progress section */}
      <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
        {/* Visual progress indicators */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-4 sm:w-6 md:w-8 rounded-full transition-all duration-300 ${
                index < progress ? 'bg-green-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Info button */}
      <button
        onClick={() => navigate('/info')}
        aria-label="View Lesson Information"
      >{/*className=""p-2 sm:p-3 rounded-full hover:bg-gray-700 focus:ring-2 focus:ring-white transition-transform transform hover:scale-105*/}
        <img
          src={InfoIcon}
          alt="Info Icon"
          className="h-8 w-8 sm:h-10 sm:w-10 opacity-0"
        />
      </button>
    </div>
  );
}

export default SubHeading2;