import React, { useState, useEffect } from 'react'
import HamburgerMenu from '../assets/images/Hamburger Menu.png'
import MenuButton from '../assets/images/Menu Button.png'   

function SubHeading({ toggleNav, toggleLearningPath, title }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [title]);

  useEffect(() => {
    if (currentIndex < title.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + title[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100); // Adjust typing speed here (lower = faster)

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, title]);

  return (
    <div className="bg-[#1F274D] flex items-center justify-between px-7 py-3 shadow-md border-b-1 border-gray-200">
      {/* ✅ Click Button to Toggle Sidebar */}
      <button onClick={toggleNav}>
        <img src={HamburgerMenu} alt="Menu Icon" className="h-4 w-7 cursor-pointer" />
      </button> 

      {/* Center: Subheading Title */}
      <h2 className="text-white font-bold text-lg tracking-wide">
        {displayText}
        <span className="animate-pulse">|</span>
      </h2>

      {/* Right: Mene Icon */}
      <button onClick={toggleLearningPath}>
        <img src={MenuButton} alt="Swap Icon" className="h-6 w-7 cursor-pointer" />
      </button>
    </div>
  )
}

export default SubHeading