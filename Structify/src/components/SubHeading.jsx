import React from 'react'
import HamburgerMenu from '../assets/images/Hamburger Menu.png'
import MenuButton from '../assets/images/Menu Button.png'

function SubHeading({ toggleNav }) {
  return (
    <div className="bg-[#1F274D] flex items-center justify-between px-7 py-3 shadow-md border-b-1 border-gray-200 w-full">
      {/* ✅ Click Button to Toggle Sidebar */}
      <button onClick={toggleNav}>
        <img src={HamburgerMenu} alt="Menu Icon" className="h-4 w-7 cursor-pointer" />
      </button>

      {/* Center: Subheading Title */}
      <h2 className="text-white font-bold text-lg tracking-wide">
        Introduction to Data Structures
      </h2>

      {/* Right: Swap/Refresh Icon */}
      <button>
        <img src={MenuButton} alt="Swap Icon" className="h-6 w-7" />
      </button>
    </div>
  )
}

export default SubHeading