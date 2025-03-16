import React from 'react'

function LessonPages({ title, description, leftIcon, rightIcon, lessonImage }) {
  return (
    <div className="bg-[#1F274D] text-white p-8 rounded-lg flex flex-col items-center">
      {/* Title */}
      <h2 className="text-4xl font-bold mb-4 text-center">{title}</h2>

      {/* Description */}
      <p className="text-center max-w-2xl text-2xl mb-6">{description}</p>

      {/* Image with Arrows for Navigation */}
      <div className="flex items-center space-x-50">
        {/* Left Arrow */}
        <button>
          <img src={leftIcon} alt="Previous" className="h-12 w-7 cursor-pointer " />
        </button>

        {/* Lesson Image */}
        <img src={lessonImage} alt="Lesson" className="h-80 w-auto" />

        {/* Right Arrow */}
        <button>
          <img src={rightIcon} alt="Next" className="h-12 w-7 cursor-pointer " />
        </button>
      </div>
    </div>
  )
}

export default LessonPages