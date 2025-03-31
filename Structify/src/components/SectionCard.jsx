import React from 'react';
import CreateIcon from '../assets/images/Create Icon.png';

function SectionCard({ sectionName, instructor, studentCount }) {
  return (
    <div className="w-64 h-60 mb-3 rounded-xl overflow-hidden shadow-md bg-white hover:shadow-lg transition duration-300 cursor-pointer">
      {/* Header Section */}
      <div className="h-3/5 bg-[#141a35] relative">
        <div className="absolute top-3 right-3">
          <img className="h-4 w-4" src={CreateIcon} alt="Create Icon" />
        </div>
      </div>
      {/* Info Section */}
      <div className="h-3/5 bg-gray-100 p-3">
        <h3 className="text-md font-semibold text-gray-800">{sectionName}</h3>
        <p className="text-sm text-gray-600">Instructor: {instructor}</p>
        <p className="text-sm text-gray-600">Students: {studentCount}</p>
      </div>
    </div>
  );
}

export default SectionCard;
