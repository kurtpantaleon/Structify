import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import Bullet1 from '../../../assets/clip/clip1.mp4';
import Bullet2 from '../../../assets/clip/clip2.mp4';
import Bullet3 from '../../../assets/clip/clip3.mp4';
import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';
import LessonFooter from '../../../components/LessonFooter';

export default function Page1() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

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
      mediaType: 'video',
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
      mediaType: 'video',
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
      mediaType: 'video',
      video: Bullet3,
    },
  ];

  const nextLesson = () => {
    if (currentIndex < lessons.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevLesson = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1F274D] to-[#0E1328] text-white flex flex-col font-sans relative">
      <Header />

      {/* Top bar with navigation arrows + progress bar */}
      <SubHeading2
        progress={currentIndex + 1}
        totalSteps={lessons.length}
        exitPath="/mainPage"
        onNext={nextLesson}
        onPrev={prevLesson}
      />

      {/* Lesson content area */}
      <div className="flex-grow flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 px-4 sm:px-6 md:px-8 py-4 sm:py-6 overflow-y-auto">
        <LessonPages
          title={
            <span className="text-xl sm:text-2xl md:text-3xl font-black text-center text-teal-400 drop-shadow-md">
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
          className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-sm sm:text-base md:text-lg font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 mx-auto mb-4 sm:mb-6"
        />
      )}
    </div>
  );
}