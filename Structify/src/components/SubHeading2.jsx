import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Info, ArrowLeft, ArrowRight } from 'lucide-react';

function SubHeading2({ progress = 1, totalSteps = 8, exitPath = '/mainPage' }) {
  const navigate = useNavigate();
  
  // Calculate completion percentage
  const completionPercentage = Math.round((progress / totalSteps) * 100);

  return (
    <div className="bg-gradient-to-r from-[#1a2249] to-[#1F274D] flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 shadow-md border-b border-white/10 relative">
      {/* Exit button with enhanced styling */}
      <button
        onClick={() => navigate(exitPath)}
        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 focus:ring-2 focus:ring-red-500/40 focus:outline-none transition-all duration-200 transform hover:scale-105 active:scale-95"
        aria-label="Exit Lesson"
        title="Exit Lesson"
      >
        <X className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Enhanced Progress section */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-gray-700">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-green-400 rounded-r-full transition-all duration-500 ease-out"
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2 mb-1">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`group relative transition-all duration-300 ${
                index + 1 === progress ? 'scale-110' : ''
              }`}
            >
              <div
                className={`h-2 w-5 sm:w-7 md:w-8 rounded-full transition-all duration-300 ${
                  index < progress 
                    ? 'bg-gradient-to-r from-blue-400 to-green-400 shadow-sm shadow-blue-400/30' 
                    : index + 1 === progress 
                      ? 'bg-blue-500 animate-pulse' 
                      : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
              
              {/* Step number tooltip */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Step {index + 1}
              </div>
            </div>
          ))}
        </div>
        
        {/* Numerical progress indicator */}
        <div className="text-white/80 text-xs font-medium bg-white/10 px-2 py-0.5 rounded-full">
          {progress} of {totalSteps} <span className="text-green-400">({completionPercentage}%)</span>
        </div>
      </div>

      {/* Info button with enhanced styling */}
      <button
        onClick={() => navigate('/info')}
        className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 focus:ring-2 focus:ring-blue-500/40 focus:outline-none transition-all duration-200 transform hover:scale-105 active:scale-95"
        aria-label="View Lesson Information"
        title="Lesson Information"
      >
        <Info className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      
      {/* Navigation controls - Based on onNext and onPrev props */}
      {/* {(onNext || onPrev) && (
        <div className="absolute bottom-14 right-4 sm:right-6 flex items-center space-x-2">
          {onPrev && (
            <button
              onClick={onPrev}
              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700/70 text-white focus:ring-2 focus:ring-white/40 focus:outline-none transition-all duration-200"
              aria-label="Previous Step"
              title="Previous Step"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          
          {onNext && (
            <button
              onClick={onNext}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500/40 focus:outline-none transition-all duration-200 shadow-md hover:shadow-lg"
              aria-label="Next Step"
              title="Next Step"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>
      )} */}
    </div>
  );
}

export default SubHeading2;