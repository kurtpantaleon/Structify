import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function WeekButton({ status, icon, title, iconType, path }) {
  const navigate = useNavigate(); // Initialize navigation hook
  const [isLoading, setIsLoading] = useState(false); // To manage loading state

  const handleClick = () => {
    setIsLoading(true); // Show loading animation on click
    setTimeout(() => {
      navigate(path); // Navigate after loading
    }, 1000); // Simulate delay before navigation
  };

  return (
    <button
      onClick={handleClick}
      className="overflow-hidden flex items-center justify-between w-full px-4 py-4.5 bg-gradient-to-r from-blue-900 to-blue-1000 rounded-lg border border-white/100 text-white cursor-pointer hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 ease-in-out shadow-xl hover:shadow-2xl"
    >
      {/* Left: Icon + Title */}
      <div className="flex items-center space-x-3">
        <img src={iconType} alt={title} className="w-8 h-6 transform transition-all duration-300 ease-in-out hover:rotate-12" />
        <span className="font-semibold text-lg">{title}</span>
      </div>

      {/* Right: Status + Check Icon */}
      <div className="flex items-center space-x-2 text-xs">
        <span className="border border-white/100 px-4 py-1 rounded-lg min-w-[100px] text-center bg-opacity-50">
          {status}
        </span>

        {isLoading ? (
          // Placeholder loading spinner (Game-like)
          <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin" />
        ) : (
          <img src={icon} alt={status} className="w-5 h-5 transform transition-all duration-300 ease-in-out hover:rotate-12" />
        )}
      </div>
    </button>
  );
}

export default WeekButton;
