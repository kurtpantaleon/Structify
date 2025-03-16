import React, { useState } from 'react';

function LessonPages({ title, lessons, leftIcon, rightIcon }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to move forward
  const nextLesson = () => {
    if (currentIndex < lessons.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  // Function to move backward
  const prevLesson = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  return (
    <div className="bg-[#1F274D] text-white p-8 rounded-lg flex flex-col items-center">
      {/* Title */}
      <h2 className="text-4xl font-bold mb-4 text-center">{title}</h2>

      {/* Description */}
      <p className="text-center max-w-2xl text-2xl mb-6">
        {lessons[currentIndex].description}
      </p>

      {/* Image with Arrows for Navigation */}
      <div className="flex items-center space-x-10">
        {/* Left Arrow */}
        <button onClick={prevLesson} disabled={currentIndex === 0}>
          <img 
            src={leftIcon} 
            alt="Previous" 
            className={`h-12 w-7 cursor-pointer ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} 
          />
        </button>

        {/* Lesson Image */}
        <img 
          src={lessons[currentIndex].image} 
          alt="Lesson" 
          className="h-80 w-auto"
        />

        {/* Right Arrow */}
        <button onClick={nextLesson} disabled={currentIndex === lessons.length - 1}>
          <img 
            src={rightIcon} 
            alt="Next" 
            className={`h-12 w-7 cursor-pointer ${currentIndex === lessons.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`} 
          />
        </button>
      </div>
    </div>
  );
}

export default LessonPages;
