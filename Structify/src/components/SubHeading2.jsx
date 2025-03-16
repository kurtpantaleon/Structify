import React from 'react';
import XIcon from '../assets/images/X Icon.png';
import InfoIcon from '../assets/images/Information Icon.png';
import LeftNextIcon from '../assets/images/Left Next Icon.png';
import RightNextIcon from '../assets/images/Right Next Icon.png';

function SubHeading2({ progress = 1, totalSteps = 8 }) {
  return (
    <div className="bg-[#1F274D] flex items-center justify-between px-7 py-3 shadow-md border-b-1 border-gray-200">
        {/* ✅ Click Button to Toggle Sidebar */}
        <button>
        <img src={XIcon} alt="Menu Icon" className="h-5 w-5 cursor-pointer" />
        </button> 

        {/* Center: Progress Bar Navigation */}
        <div className="flex items-center space-x-10">
            <img src={RightNextIcon} alt="Left Next Icon" className="h-5 w-3 cursor-pointer" />

            {/* Progress Bar */}
            <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                key={index}
                className={`h-1.5 w-14 rounded-full ${
                    index < progress ? "bg-green-600" : "bg-gray-500"
                }`}
                ></div>
            ))}
            </div>

            <img src={LeftNextIcon} alt="Right Next Icon" className="h-5 w-3 cursor-pointer" />
        </div>

        {/* Right: Mene Icon */}
        <button>
        <img src={InfoIcon} alt="Swap Icon" className="h-10 w-10 cursor-pointer" />
        </button>
    </div>
  )
}

export default SubHeading2