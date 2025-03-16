import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import robot from '../assets/images/robot.png';
import Logo2 from '../assets/images/Logo2.png';

function StartPage() {
  const navigate = useNavigate(); // Initialize navigation

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between w-screen h-screen overflow-hidden bg-[#1F274D]">
      
      {/* Left side */}
      <div className="flex items-center justify-center w-full lg:w-1/2 h-1/2 lg:h-full flex-col p-6 sm:p-10 space-y-4">
        <img className="w-48 sm:w-64 lg:w-80" src={Logo2} alt="Logo" />
        <img className="w-48 sm:w-64 lg:w-80" src={robot} alt="Robot" />

        <div className="text-center text-white font-bold space-y-2 mt-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl">Learn to code</h1>
          <p className="text-sm sm:text-base lg:text-xl font-light px-4 sm:px-10 lg:px-0">
            Understand data structures and algorithms to code smarter and solve problems efficiently.
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center justify-center flex-col p-6 sm:p-10 lg:p-16 bg-white rounded-t-3xl lg:rounded-l-3xl lg:rounded-t-none shadow-lg w-full lg:w-1/2 h-1/2 lg:h-full space-y-8">
        <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-center">Select your account</h1>

        <div className="flex items-center flex-col gap-4 w-full px-4">
          {/* Student button */}
          <button
            onClick={() => navigate('/mainPage')}
            className="bg-blue-500 text-white py-3 rounded-lg w-full max-w-xs hover:bg-blue-600 transition-all duration-200"
          >
            Student
          </button>

          {/* Admin button */}
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white py-3 rounded-lg w-full max-w-xs hover:bg-blue-600 transition-all duration-200"
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}

export default StartPage;
