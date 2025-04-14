import React from 'react';

function LessonFooter({ buttonText, onClick, path = '#' }) {
  return (
    <div className="bg-[#1F274D] py-3 sm:py-4 px-4 sm:px-6 md:px-8 flex justify-center border-t border-white/20">
      <button
        onClick={() => onClick(path)}
        className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white font-extrabold text-sm sm:text-base md:text-lg px-6 sm:px-8 py-2 sm:py-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-auto max-w-xs"
        aria-label={buttonText}
      >
        {buttonText}
      </button>
    </div>
  );
}

export default LessonFooter;