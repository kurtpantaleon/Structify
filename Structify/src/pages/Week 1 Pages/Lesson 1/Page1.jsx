import React, { useState } from 'react'; // React and useState hook
import { useNavigate } from 'react-router-dom'; // For navigation between pages

// Importing components and assets
import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';

import Bullet1 from '../../../assets/clip/clip1.mp4';
import Bullet2 from '../../../assets/clip/clip2.mp4';
import Bullet3 from '../../../assets/clip/clip2.mp4';



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
          A data structure is a way to{' '}
          <span className="font-extrabold text-yellow-400 animate-pulse">
            store and organize data efficiently
          </span>{' '}
          so that it can be used effectively.
        </>
      ),
      video: Bullet1, // MP4 video source
    },
    {
      description: (
        <>
          Computers process{' '}
          <span className="font-extrabold text-green-400 animate-pulse">
            massive amounts of data every second
          </span>{' '}
          , so efficient organization is essential.
        </>
      ),
      video: Bullet2,
    },
    {
      description: (
        <>
          Just like drawers organize clothes,{' '}
          <span className="font-extrabold text-blue-400 animate-pulse">
            data structures help organize and manage information in a structured way
          </span>{' '}
          .
        </>
      ),
      video: Bullet3,
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
        onNext={nextLesson}
        onPrev={prevLesson}
      />

      {/* Lesson content area */}
      <div className="flex-grow flex flex-col justify-center items-center gap-8 overflow-y-auto px-4 animate-fade-in">
        <LessonPages
          title={
            <span className="text-3xl font-black text-center text-teal-400 drop-shadow-md">
              What is Data Structure?
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
          onClick={() => navigate('/page2')}
          className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-lg font-bold py-3 px-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
        />
      )}
    </div>
  );
}
