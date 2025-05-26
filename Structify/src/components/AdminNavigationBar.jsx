import React from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import HomeIcon from "../assets/images/Home Icon.png"; 
import InstructorIcon from "../assets/images/Instructor Icon.png"; 
import StudentIcon from "../assets/images/Student Icon.png"; 

const AdminNavigationBar = () => {
  // Get the current location to determine active nav item
  const location = useLocation();
  
  return (
    <div className="fixed bg-gradient-to-b from-[#1a2045] to-[#1F274D] h-screen w-20 flex flex-col items-center py-8 space-y-6 px-1 border-r border-indigo-900/40 shadow-lg z-40">
     
      {/* Navigation Icons */}
      <nav className="flex flex-col space-y-6">
        <NavItem 
          to="/AdminPage" 
          icon={HomeIcon} 
          label="Home" 
          isActive={location.pathname === '/AdminPage'} 
        />
        <NavItem 
          to="/ViewInstructorPage" 
          icon={InstructorIcon} 
          label="Instructor" 
          isActive={location.pathname === '/ViewInstructorPage'} 
        />
        <NavItem 
          to="/ViewStudentsPage" 
          icon={StudentIcon} 
          label="Student" 
          isActive={location.pathname === '/ViewStudentsPage'} 
        />
      </nav>
    </div>
  );
};

// Enhanced Navigation Item Component with active state
const NavItem = ({ to, icon, label, isActive }) => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate(to);
  };

  return (
    <div 
      className={`relative flex flex-col items-center cursor-pointer group p-3 rounded-xl transition-all duration-200
        ${isActive ? 'bg-blue-600/20' : 'hover:bg-white/10'}`}
      onClick={handleNavigation}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleNavigation()}
    >
      {/* Image Icon with enhanced states */}
      <div className="relative">
        <div className={`p-1 rounded-lg transition-transform duration-200 ${isActive ? 'transform scale-110' : 'group-hover:scale-105'}`}>
          <img 
            src={icon} 
            alt={label} 
            className={`h-8 w-8 transition-all duration-200 
              ${isActive ? 'filter brightness-110' : 'group-hover:brightness-110'}`}
          />
        </div>
        
        {/* Active indicator glow effect */}
        {isActive && (
          <div className="absolute inset-0 bg-blue-400/20 blur-md rounded-full -z-10"></div>
        )}
      </div>
      
      {/* Label with enhanced active state */}
      <span className={`text-xs mt-2 transition-all duration-200 
        ${isActive ? 'text-blue-300 font-medium' : 'text-gray-300 group-hover:text-white'}`}>
        {label}
      </span>
      
      {/* Active indicator line */}
      {isActive && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>
      )}
      
      {/* Tooltip on hover */}
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {label}
      </div>
    </div>
  );
};

export default AdminNavigationBar;
