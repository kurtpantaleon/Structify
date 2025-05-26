import React from 'react';
import WeekButton from './WeekButton';
import CheckIcon from '../assets/images/Check Icon.png';
import UncheckIcon from '../assets/images/Uncheck Icon.png';
import StudyIcon from '../assets/images/Study Icon.png';

function InstructorEditedLessons({ lessonType, onLessonTypeChange }) {
  return (
    <div className="w-full lg:w-1/2 flex-shrink-0 bg-[#141a35] p-4 sm:p-6 rounded-lg shadow-xl mt-6 lg:mt-0 relative group overflow-hidden">
      {/* Glowing animated border */}
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-900 to-blue-900 blur-lg opacity-50 group-hover:opacity-100 transition-all duration-500 z-0" />

      {/* Moving background icon */}
      <div className="absolute top-1/2 left-[-20%] w-72 h-72 bg-gradient-to-tr from-indigo-400 via-blue-500 to-transparent 
                    opacity-20 animate-move-slow rounded-full blur-3xl z-0" />

      {/* Content wrapper with z-index */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white">INSTRUCTOR EDITED LESSONS</h2>
          <select 
            className="bg-[#1F274D] text-white border border-white/20 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={lessonType}
            onChange={onLessonTypeChange}
          >
            <option value="structify">Structify Lessons</option>
            <option value="instructor">Instructor Lessons</option>
          </select>
        </div>
        <div className="border-t border-white/50 w-full mb-4 sm:mb-5"></div>

        {/* Lessons */}
        <div className="space-y-3 sm:space-y-4">
          <WeekButton 
            title="Instructor Lesson 1" 
            status="LEARN" 
            icon={UncheckIcon}
            iconType={StudyIcon} 
            path="/instructor-lesson-1"
          />
          <WeekButton 
            title="Instructor Lesson 2" 
            status="LEARN" 
            icon={UncheckIcon}
            iconType={StudyIcon} 
            path="/instructor-lesson-2"
          />
          <WeekButton 
            title="Instructor Lesson 3" 
            status="LEARN" 
            icon={UncheckIcon}
            iconType={StudyIcon} 
            path="/instructor-lesson-3"
          />
        </div>
      </div>
    </div>
  );
}

export default InstructorEditedLessons;
