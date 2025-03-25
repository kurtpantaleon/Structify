import React from 'react';
import { useNavigate } from 'react-router-dom';

// Icon assets
import XIcon from '../assets/images/X Icon.png';
import InfoIcon from '../assets/images/Information Icon.png';


function SubHeading2({ progress = 1, totalSteps = 8, onNext, onPrev }) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#1F274D] flex items-center justify-between px-4 sm:px-7 py-3 shadow-md border-b border-white/10">
      {/* Exit or menu button */}
      <button onClick={() => navigate('/mainPage')} className="transition-transform transform hover:scale-110">
        <img src={XIcon} alt="Menu Icon" className="h-6 w-6 sm:h-5 sm:w-5 cursor-pointer" />
      </button>

      {/* Progress section with arrows and progress bar */}
      <div className="flex items-center space-x-4 sm:space-x-10">
      
       

        {/* Visual progress indicators */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-6 sm:w-14 rounded-full transition-all duration-300 ${
                index < progress ? 'bg-green-400' : 'bg-gray-600'
              }`}
            ></div>
          ))}
        </div>

       
      </div>

      {/* Info button */}
      <button onClick={() => navigate('/info')} className="hover:scale-110 transition-transform">
        <img src={InfoIcon} alt="Info Icon" className="h-10 w-10 cursor-pointer" />
      </button>
    </div>
  );
}

export default SubHeading2;
