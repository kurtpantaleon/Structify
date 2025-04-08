import React from 'react';

function LessonPages({ title, lessons, leftIcon, rightIcon, currentIndex, nextLesson, prevLesson }) {
  return (
    <div className="bg-[#1F274D] text-white px-10 py-1 rounded-lg flex flex-col gap-1 items-center h-130">
      {/* Slide title */}
      <h2 className="text-4xl font-bold mb-4 text-center">{title}</h2>

      {/* Slide description */}
      <p className="text-center max-w-2xl text-2xl mb-6">
        {lessons[currentIndex].description}
      </p>

      {/* Slide video */}
      <div className="flex items-center justify-between w-250 h-full relative">
        {/* Left arrow */}
        <button
          onClick={prevLesson}
          disabled={currentIndex === 0}
          className={`transform transition-all duration-300 ease-in-out 
            ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <img
            src={leftIcon}
            alt="Previous"
            className={`h-12 w-7 
              ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''} 
              hover:scale-125 hover:filter hover:brightness-125 transition-transform duration-500 ease-in-out`} 
          />
        </button>

        {/* Conditional rendering of video or image */}
        <div className="relative ">
          {/* If it's a video, show the video player */}
          {lessons[currentIndex].mediaType === 'video' ? (
            <video
              src={lessons[currentIndex].video} // Use the video source
              alt="Lesson"
              className={`${
                lessons[currentIndex].resizeClass || 'h-85'
              } w-auto border-4 border-yellow-400 rounded-2xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:brightness-110`}
              autoPlay
              loop
              muted // Auto-play and muted for mobile compatibility
            />
          ) : (
            // Otherwise, display the image
            <img
              src={lessons[currentIndex].image} // Use the image source
              alt="Lesson"
              className={`${
                lessons[currentIndex].resizeClass || 'h-85'
              } w-auto border-10 border-yellow-400 rounded-2xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:brightness-110`}
            />
          )}

          {/* Gamified visual: Glow effect on media */}
          <div className="absolute inset-0 rounded-2xl border-10 border-teal-600 animate-pulse h-85" />
        </div>

        {/* Right arrow */}
        <button
          onClick={nextLesson}
          disabled={currentIndex === lessons.length - 1}
          className={`transform transition-all duration-300 ease-in-out 
            ${currentIndex === lessons.length - 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <img
            src={rightIcon}
            alt="Next"
            className={`h-12 w-7 
              ${currentIndex === lessons.length - 1 ? 'opacity-50 cursor-not-allowed' : ''} 
              hover:scale-125 hover:filter hover:brightness-125 transition-transform duration-500 ease-in-out`} 
          />
        </button>
      </div>
    </div>
  );
}

export default LessonPages;
