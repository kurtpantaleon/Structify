import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import robot from '../assets/images/robot.png';
import Logo2 from '../assets/images/Logo2.png';

function StartPage() {
  const navigate = useNavigate(); // Initialize navigation

  return (
    <div className='flex items-center justify-between w-screen h-screen overflow-hidden'>
      
      {/* Left side */}
      <div className='flex items-center w-full h-full flex-col p-5 mt-30'>
        <img className='w-80' src={Logo2} alt="Logo" />
        <img className='w-85' src={robot} alt="Robot" />

        <div className='text-center text-white font-bold'>
          <h1 className='text-5xl'>Learn to code</h1>
          <p className='w-sm font-light text-xl'>
            Understand data structures and algorithms to code smarter and solve problems efficiently.
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className='flex items-center justify-center flex-col p-20 mr-20 bg-white rounded-xl h-230 w-5xl'>
        <h1 className='mb-50 font-bold text-4xl'>Select your account</h1>

        <div className='flex items-center flex-col gap-5 mt-10'>
          {/*  Add onClick to navigate */}
          <button
            onClick={() => navigate('/mainPage')} // Route to Student page
            className="bg-blue-500 text-white py-2 rounded-lg w-60"
          >
            Student
          </button>

          <button
            onClick={() => navigate('/')} // Route to Admin page
            className="bg-blue-500 text-white py-2 rounded-lg w-60"
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}

export default StartPage;
