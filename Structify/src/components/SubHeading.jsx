import React from 'react';
import HamburgerMenu from '../assets/images/Hamburger Menu.png';
import MenuButton from '../assets/images/Menu Button.png';

function SubHeading({ toggleNav, toggleLearningPath, title }) {
  return (
    <div className="bg-[#1F274D] flex items-center justify-between px-4 sm:px-6 md:px-8 py-2 sm:py-3 shadow-md border-b border-gray-200">
      {/* Left: Hamburger Menu Button */}
      <button
        onClick={toggleNav}
        className="p-2 sm:p-3 rounded-full hover:bg-gray-700 focus:ring-2 focus:ring-white"
        aria-label="Toggle Navigation Sidebar"
      >
        <img
          src={HamburgerMenu}
          alt="Menu Icon"
          className="h-5 w-6 sm:h-6 sm:w-7 cursor-pointer"
        />
      </button>

      {/* Center: Subheading Title */}
      <h2 className="text-white font-bold text-base sm:text-lg md:text-xl tracking-wide text-center flex-1">
        {title}
      </h2>

      {/* Right: Learning Path Button */}
      <button
        onClick={toggleLearningPath}
        className="p-2 sm:p-3 rounded-full hover:bg-gray-700 focus:ring-2 focus:ring-white"
        aria-label="Toggle Learning Path"
      >
        <img
          src={MenuButton}
          alt="Learning Path Icon"
          className="h-5 w-6 sm:h-6 sm:w-7 cursor-pointer"
        />
      </button>
    </div>
  );
}

export default SubHeading;