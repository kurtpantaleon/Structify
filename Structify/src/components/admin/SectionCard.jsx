import React from 'react';
import CreateIcon from '../assets/images/Create Icon.png';

function SectionCard({ sectionName, instructor, studentCount }) {
  return (
    <div
      className="w-full sm:w-60 md:w-64 h-auto rounded-xl overflow-hidden shadow-md bg-white hover:shadow-lg transition duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
      tabIndex={0}
      role="button"
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
    >
      {/* Header Section */}
      <div className="relative bg-[#141a35] h-32 sm:h-36">
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <img
            className="h-3 w-3 sm:h-4 sm:w-4"
            src={CreateIcon}
            alt="Edit Section Icon"
          />
        </div>
      </div>
      {/* Info Section */}
      <div className="bg-gray-100 p-2 sm:p-3">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 line-clamp-1">
          {sectionName}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
          Instructor: {instructor}
        </p>
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
          Students: {studentCount}
        </p>
      </div>
    </div>
  );
}

export default SectionCard;