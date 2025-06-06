import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import LessonFooter from '../../../components/LessonFooter';
import Bullet1 from '../../../assets/image/Lesson1.1/image7.png';
import Bullet2 from '../../../assets/image/Lesson1.1/image6.png';
import Bullet3 from '../../../assets/image/Lesson1.1/image8.png';
import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';

export default function Page4() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const lessons = [
    {
      description: (
        <>
          <span className="font-extrabold text-yellow-400 animate-pulse">
            Phone Contact List:
          </span>{' '} Stores names and numbers{' '}
          <span className="font-extrabold text-yellow-400 animate-pulse">
            alphabetically
          </span>{' '} for easy lookup.
        </>
      ),
      mediaType: 'image',
      image: Bullet1,
    },
    {
      description: (
        <>
          <span className="font-extrabold text-green-400 animate-pulse">
            Bookshelf Organization:
          </span>{' '}
          so efficient organization is essential.
        </>
      ),
      mediaType: 'image',
      image: Bullet2,
    },
    {
      description: (
        <>
          <span className="font-extrabold text-blue-400 animate-pulse">
            To-Do List:
          </span>{' '} Prioritizes tasks in a structured way.
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
      <div className="flex-grow flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 overflow-y-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 animate-fade-in">
        <LessonPages
          title={
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-center text-teal-400 drop-shadow-md">
              Real-Life Examples of Data Structures
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
          onClick={() => navigate('/page5')}
          className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-base sm:text-lg md:text-xl font-bold py-2 sm:py-3 md:py-4 px-4 sm:px-6 md:px-8 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 mb-4 sm:mb-6 md:mb-8"
        />
      )}
    </div>
  );
}