import React, { useState, useEffect } from 'react'
import { Menu, BookOpen } from 'lucide-react'

function SubHeading({ toggleNav, toggleLearningPath, title }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typingComplete, setTypingComplete] = useState(false);

  // Reset typing animation when title changes
  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
    setTypingComplete(false);
  }, [title]);

  // Handle typing animation with dynamic speed
  useEffect(() => {
    if (currentIndex < title.length) {
      // Gradually decrease typing speed as we progress
      const speed = Math.max(40, 100 - currentIndex * 2);
      
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + title[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        
        // Check if typing is complete
        if (currentIndex === title.length - 1) {
          setTypingComplete(true);
        }
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, title]);

  return (
    <div className="bg-gradient-to-r from-[#1a2249] to-[#1F274D] flex items-center justify-between px-4 sm:px-7 py-3.5 shadow-lg border-b border-indigo-900/40">
      {/* Left: Navigation Toggle Button with improved styling */}
      <button 
        onClick={toggleNav}
        className="flex items-center justify-center h-9 w-9 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 active:bg-blue-600/40 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50
        hidden md:flex"
        aria-label="Toggle Navigation"
        title="Toggle Navigation"
      >
        <Menu className="h-5 w-5 text-blue-300" />
      </button> 

      {/* Center: Subheading Title with enhanced animation */}
      <div className="relative min-h-[1.75rem] flex items-center justify-center">
        <h2 className="text-white font-bold text-lg tracking-wide px-3 py-1 rounded-lg bg-blue-900/20 backdrop-blur-sm ml-6 md:ml-0 ">
          {displayText}
          <span className={`${typingComplete ? 'animate-pulse' : 'animate-blink'} ml-0.5 inline-block`}>|</span>
        </h2>
        
        {/* Optional: Decorative elements */}
        {typingComplete && (
          <div className="absolute -bottom-1 left-0 right-0 mx-auto h-0.5 w-1/2 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent rounded-full" />
        )}
      </div>

      {/* Right: Learning Path Toggle Button with improved styling */}
      <button 
        onClick={toggleLearningPath}
        className="flex items-center justify-center h-9 w-9 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 active:bg-blue-600/40 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 relative group"
        aria-label="Toggle Learning Path"
        title="Learning Path"
      >
        <BookOpen className="h-5 w-5 text-blue-300" />
        
        {/* Small tooltip on hover */}
        <span className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          Learning Path
        </span>
      </button>
    </div>
  )
}

export default SubHeading

// Add custom animations in your global CSS file:
// @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
// .animate-blink { animation: blink 1s infinite; }