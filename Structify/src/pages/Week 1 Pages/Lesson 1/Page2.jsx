import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import Bullet1 from '../../../assets/image/Lesson1.1/image1.png';
import Bullet2 from '../../../assets/image/Lesson1.1/image2.png';
import Bullet3 from '../../../assets/image/Lesson1.1/image3.png';
import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';
import LessonFooter from '../../../components/LessonFooter';

export default function Page2() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const lessons = [
    {
      description: (
        <>
          Without data structures, storing and retrieving information would be{' '}
          <span className="font-extrabold text-yellow-400 animate-pulse">
            slow and inefficient.
          </span>{' '}
        </>
      ),
      mediaType: 'image',
            image: Bullet1,
    },
    {
      description: (
        <>
          Imagine looking for a book in a{' '}
          <span className="font-extrabold text-green-400 animate-pulse">
            messy pile vs. a well-organized bookshelf.
          </span>
        </>
      ),
      mediaType: 'image',
            image: Bullet2,
    },
    {
      description: (
        <>
          Computers rely on{' '}
          <span className="font-extrabold text-blue-400 animate-pulse">
            optimized data structures
          </span>{' '}
          to handle searches, sorting, and storage operations efficiently.
        </>
      ),
     mediaType: 'image',
           image: Bullet3,
    },
  ];

  const nextLesson = () => {
    if (currentIndex < lessons.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevLesson = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-[#1F274D] to-[#0E1328] text-white flex flex-col font-sans relative">
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
      <div className="flex-grow flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-12 animate-fade-in">
        <LessonPages
          title={
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-center text-teal-400 drop-shadow-md">
              Why are Data Structures Important?
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
          onClick={() => navigate('/page3')}
          className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-base sm:text-lg font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 mb-4 sm:mb-6"
        />
      )}
    </div>
  );
}