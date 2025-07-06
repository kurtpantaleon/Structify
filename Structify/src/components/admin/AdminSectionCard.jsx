import React, { useState } from 'react';
import Menu from '../../assets/images/Threedot Icon.png';
import { Users, BookOpen, UserCheck, Calendar } from 'lucide-react';

function SectionCard({ sectionName, instructor, studentCount, academicYear, students = [], isAllYearsView = false, onClick, onEdit, onDelete, hideMenu = false }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.({ sectionName, instructor, studentCount });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.();
  };
  
  const closeMenu = () => {
    setShowMenu(false);
  };

  // Handle outside clicks
  React.useEffect(() => {
    if (showMenu) {
      const handleOutsideClick = (event) => {
        if (!event.target.closest('.menu-container')) {
          closeMenu();
        }
      };
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }
  }, [showMenu]);

  return (
    <div
      className={`w-full h-auto rounded-lg overflow-hidden shadow-md bg-white hover:shadow-xl transition-all duration-300 cursor-pointer relative ${
        isHovered ? 'transform scale-[1.02]' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Class Pattern Background */}
      <div className="h-32 bg-gradient-to-r from-[#141a35] to-[#2a3363] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-white opacity-10 pattern-grid-lg"></div>
        </div>
        
        {/* Academic Year Badge - Always visible */}
        <div className="absolute top-3 left-3">
          <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-md flex items-center">
            <Calendar className="w-3 h-3 text-white mr-1" />
            <span className="text-xs font-medium text-white">{academicYear}</span>
          </div>
        </div>
        
        {/* Section Name */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white truncate">
            {sectionName}
          </h3>
        </div>
        
        {/* Menu Button */}
        {!hideMenu && (
          <div className="absolute top-3 right-3 menu-container">
            <button 
              onClick={handleMenuClick}
              className="p-1.5 rounded-full hover:bg-white/10 transition-all"
            >
              <img className="h-4 w-1" src={Menu} alt="Menu" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
                <button
                  onClick={handleEdit}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Edit Class Name
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Delete Class
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center text-gray-600 mb-2">
          <UserCheck className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
          <p className="text-sm">
            <span className="font-medium">Instructor:</span> <span className="text-gray-700 truncate">{instructor}</span>
          </p>
        </div>
        <div className="flex items-center text-gray-600 mb-2">
          <Users className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
          <p className="text-sm">
            <span className="font-medium">Students:</span> <span className="text-gray-700">{studentCount}</span>
          </p>
        </div>
        {/* <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
          <p className="text-sm flex flex-wrap items-center">
            <span className="font-medium mr-1">Year:</span> 
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs font-medium max-w-[150px] truncate">
              {academicYear}
            </span>
          </p>
        </div> */}
      </div>
    </div>
  );
}

export default SectionCard;
