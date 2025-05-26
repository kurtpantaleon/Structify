import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';

function AdminSubHeading({ toggleNav, title }) {
  const [animateTitle, setAnimateTitle] = useState(false);

  // Add title animation when it changes
  useEffect(() => {
    setAnimateTitle(true);
    const timer = setTimeout(() => setAnimateTitle(false), 500);
    return () => clearTimeout(timer);
  }, [title]);

  return (
    <div className="bg-gradient-to-r from-[#1a2045] to-[#1F274D] flex items-center justify-between px-4 sm:px-7 py-4 shadow-md border-b border-indigo-900/40 relative">
      {/* Sidebar Toggle with improved styling */}
      <button 
        onClick={toggleNav}
        className="p-2 rounded-lg hover:bg-blue-600/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        aria-label="Toggle Navigation"
      >
        <Menu className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
      </button>

      {/* Center: Subheading with animation */}
      <h2 
        className={`text-white font-bold text-lg tracking-wide py-1 px-3 rounded-lg ${animateTitle ? 'bg-blue-900/20 backdrop-blur-sm animate-fadeIn' : ''}`}
      >
        {title}
        {animateTitle && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></span>}
      </h2>

      {/* Placeholder div to maintain layout balance */}
      <div className="w-10 h-9 opacity-0">
        {/* Empty div with same dimensions as the toggle button for spacing */}
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default AdminSubHeading;
