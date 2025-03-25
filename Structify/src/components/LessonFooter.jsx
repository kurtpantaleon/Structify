import React from 'react';

function LessonFooter({ buttonText, onClick, path = '#' }) {
  return (
    <div className="bg-[#1F274D] py-4 px-6 flex justify-center border-t border-white/20">
      <button
        onClick={() => onClick(path)}
        className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white font-extrabold text-lg px-8 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        {buttonText}
      </button>
    </div>
  );
}

export default LessonFooter;
