
import SubHeading2 from '../../../components/SubHeading2';
import Header from '../../../components/Header';
import LessonPages from '../../../components/LessonPages';
import LessonFooter from '../../../components/LessonFooter';




import Bullet1 from '../../../assets/image/Lesson3.1/image10.png';
import Bullet2 from '../../../assets/image/Lesson3.1/image11.png';
import Bullet3 from '../../../assets/image/Lesson3.1/image12.png';


import BigLeftNextIcon from '../../../assets/images/Big Left Next Icon.png';
import BigRightNextIcon from '../../../assets/images/Big Right Next Icon.png';




import React, { useState } from 'react'; // React and useState hook
import { useNavigate } from 'react-router-dom'; // For navigation between pages

export default  function L3Page4() {

   const navigate = useNavigate(); // Hook to trigger route changes
   const [currentIndex, setCurrentIndex] = useState(0); // Track current lesson index


  // Lesson content stored in an array
  const lessons = [
    {
         description: (
           <>
             <span className="font-extrabold text-yellow-400 animate-pulse">
             Stacks (LIFO): 
             </span>{' '} Used in function calls, undo features.
                     
           </>
         ),
         mediaType: 'image',
         image: Bullet1,  
        },
       {
         description: (
           <>
             <span className="font-extrabold text-green-400 animate-pulse">
             Queues (FIFO):
             </span>{' '} Used in task scheduling, buffering.
           </>
         ),
         mediaType: 'image',
         image: Bullet2,  
        },
       {
         description: (
           <>
             Paging and segmentation
             <span className="font-extrabold text-blue-400 animate-pulse">
             manage RAM efficiently
             </span>  
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
      exitPath="/mainPage"

      onNext={nextLesson}
      onPrev={prevLesson}
    />

    {/* Lesson content area */}
    <div className="flex-grow flex flex-col justify-center items-center gap-8 overflow-y-auto px-4 animate-fade-in">
      <LessonPages
        title={
          <span className="text-3xl font-black text-center text-teal-400 drop-shadow-md">
           Memory Management
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
          onClick={() => navigate('/l3page5')}
          className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-lg font-bold py-3 px-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
        />
      )}
  </div>
);
}

 
