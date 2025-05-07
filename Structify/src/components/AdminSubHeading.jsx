import React, { useState } from 'react';
import HamburgerMenu from '../assets/images/Hamburger Menu.png';
import CreateIcon from '../assets/images/Create Icon.png';

function AdminSubHeading({ toggleNav, title }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); 
  };

  return (
    <div className="bg-[#1F274D] flex items-center justify-between px-7 py-3 shadow-md border-b-1 border-gray-200 relative">
      {/* Sidebar Toggle */}
      <button onClick={toggleNav}>
        <img src={HamburgerMenu} alt="Menu Icon" className="h-4 w-7 cursor-pointer" />
      </button>

      {/* Center: Subheading */}
      <h2 className="text-white font-bold text-lg tracking-wide">
        {title}
      </h2>

      {/* Create Dropdown */}
      <div className="opacity-0">
        {/*
        <button onClick={toggleDropdown}>
          <img src={CreateIcon} alt="Create Icon" className="h-5 w-5 cursor-pointer" />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 w-40 bg-white rounded-lg shadow-lg z-50">
            <ul className="py-1 text-sm text-gray-700 font-normal">
              <li>
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer" >
                  Student
                </button>
              </li>
              <li> 
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 border-b-1 border-t-1 border-black-100 cursor-pointer">
                  Instructor
                </button>
              </li>
              <li>
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Class
                </button>
              </li>
            </ul>
          </div>
        )}* */}
        
      </div>
    </div>
  );
}

export default AdminSubHeading;
