import React, { useState } from 'react'; // React and useState hook
import { useNavigate } from 'react-router-dom'; // For navigation between pages

// Importing components and assets
import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';

import Bullet1 from '../../../assets/image/Lesson1.2/image1.png'; // Image source for lesson 1
import Bullet2 from '../../../assets/image/Lesson1.2/image2.png'; // Image source for lesson 2
import Bullet3 from '../../../assets/image/Lesson1.2/image3.png'; // Image source for lesson 3



import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';
import LessonFooter from '../../../components/LessonFooter';

export default function Page1() {
  const navigate = useNavigate(); // Hook to trigger route changes
  const [currentIndex, setCurrentIndex] = useState(0); // Track current lesson index

  // All slides in this lesson
  const lessons = [
    {
      description: (
        <>
        An{' '}
          <span className="font-extrabold text-yellow-400 animate-pulse">
          algorithm
          </span>{' '}
          is a
          <span className="font-extrabold text-yellow-400 animate-pulse">
          step-by-step process
          </span>{' '}
          used to solve a problem.
        </>
      ),
       mediaType: 'image',
       image: Bullet1,      
     },
    {
      description: (
        <>
          It is a{' '}
          <span className="font-extrabold text-green-400 animate-pulse">
          set of instructions
          </span>{' '}
          , that tell a computer how to accomplish a task.
        </>
      ),
       mediaType: 'image',
       image: Bullet2,      
     },
    {
      description: (
        <>
          Algorithms are used in {' '}
          <span className="font-extrabold text-blue-400 animate-pulse">
          search engines, games, banking systems, and more.
          </span>{' '}
          .
        </>
      ),
       mediaType: 'image',
       image: Bullet3,      
     }
  ];

  // Move to next lesson if not last
  const nextLesson = () => {
    if (currentIndex < lessons.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Move to previous lesson if not first
  const prevLesson = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-[#1F274D] to-[#0E1328] text-white flex flex-col font-sans relative">
      <Header />

      {/* Top bar with navigation arrows + progress bar */}
      <SubHeading2
        progress={currentIndex + 1} // 1-based progress index
        totalSteps={lessons.length}    
        exitPath="/week2Page"

        onNext={nextLesson}
        onPrev={prevLesson}
      />

      {/* Lesson content area */}
      <div className="flex-grow flex flex-col justify-center items-center gap-8 overflow-y-auto px-4 animate-fade-in">
        <LessonPages
          title={
            <span className="text-3xl font-black text-center text-teal-400 drop-shadow-md">
             What is an Algorithm?
            </span>
          }
          lessons={lessons}
          currentIndex={currentIndex}
          nextLesson={nextLesson}
          prevLesson={prevLesson}
          leftIcon={BigLeftNextIcon}
          rightIcon={BigRightNextIcon}
        />
      </div>

      {/* Conditionally render the footer button when at last lesson */}
      {currentIndex === lessons.length - 1 && (
        <LessonFooter
          buttonText="Continue"
          onClick={() => navigate('/week2page2')}
          className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-lg font-bold py-3 px-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
        />
      )}
    </div>
  );
}
