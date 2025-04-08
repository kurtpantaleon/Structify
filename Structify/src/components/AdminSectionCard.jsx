import React, { useState } from 'react';
import Menu from '../assets/images/Threedot Icon.png';

function SectionCard({ sectionName, instructor, studentCount, onClick, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = (e) => {
    e.stopPropagation(); // prevent triggering card click
    setShowMenu(!showMenu);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(); // callback from parent
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(); // callback from parent
  };

  return (
    <div
      className="w-64 h-60 mb-3 rounded-xl overflow-hidden shadow-md bg-white hover:shadow-lg transition duration-300 cursor-pointer relative"
      onClick={onClick}
    >
      {/* Header Section */}
      <div className="h-3/5 bg-[#141a35] relative">
        <div className="absolute top-4 right-4">
          <button onClick={handleMenuClick}>
            <img className="h-5 w-1.5 cursor-pointer hover:scale-120 transition duration-150" src={Menu} alt="Menu" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow z-50">
              <button
                onClick={handleEdit}
                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Edit Name
              </button>
              <button
                onClick={handleDelete}
                className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 cursor-pointer"
              >
                Delete Section
              </button>
            </div>
          )}
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
