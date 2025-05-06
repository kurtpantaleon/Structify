import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import LessonFooter from '../../../components/LessonFooter';

import Bullet1 from '../../../assets/image/Lesson2.1/image7.png';
import Bullet2 from '../../../assets/image/Lesson2.1/image8.png';
import Bullet3 from '../../../assets/image/Lesson2.1/image9.png';

import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';

import React, { useState } from 'react'; // React and useState hook
import { useNavigate } from 'react-router-dom'; // For navigation between pages
import { useLessonProgress } from '../../../context/lessonProgressContext'; // Importing the lesson progress context

export default  function L2Page3() {
   const { markLessonComplete } = useLessonProgress(); // declaring the markLessonComplete function from the context
   const navigate = useNavigate(); // Hook to trigger route changes
   const [currentIndex, setCurrentIndex] = useState(0); // Track current lesson index

  // Lesson content stored in an array
  const lessons = [
    {
          description: (
            <>
              Works like a{' '}
              <span className="font-extrabold text-yellow-400 animate-pulse">
              line of people
              </span>{' '}
              waiting at a bank.
            </>
          ),
       mediaType: 'image',
       image: Bullet1,   
        },
        {
          description: (
            <>
              <span className="font-extrabold text-green-400 animate-pulse">
              (FIFO - First In, First Out)
              </span>{' '}
              The first person in line is served first.
            </>
          ),
          mediaType: 'image',
          image: Bullet2,
        },
        {
          description: (
            <>
              
              <span className="font-extrabold text-blue-400 animate-pulse">
              Code Example: 
              </span>{' '}
              Browser back button history.
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
      exitPath="/mainPage"

      onNext={nextLesson}
      onPrev={prevLesson}
    />

    {/* Lesson content area */}
    <div className="flex-grow flex flex-col justify-center items-center gap-8 overflow-y-auto px-4 animate-fade-in">
      <LessonPages
        title={
          <span className="text-3xl font-black text-center text-teal-400 drop-shadow-md">
            Types of Basic Data Structures
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
          onClick={() => {
            markLessonComplete('lesson2'); // Mark the lesson as complete when button is clicked
            navigate('/l3page1');
          }}
          className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-lg font-bold py-3 px-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
        />
      )}
  </div>
);

/// Function to handle marking the lesson as complete
const handleComplete = () => {
  markLessonComplete("lesson2");
};
}

 
