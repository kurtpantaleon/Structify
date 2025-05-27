import React from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import HomeIcon from "../assets/images/Home Icon.png"; 
import InstructorIcon from "../assets/images/Instructor Icon.png"; 
import StudentIcon from "../assets/images/Student Icon.png"; 

// Add CSS keyframes for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes float {
    0% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
    100% { transform: translateY(0); }
  }
  
  .nav-pulse {
    animation: pulse 2s infinite ease-in-out;
  }
  
  .nav-float:hover {
    animation: float 1.5s infinite ease-in-out;
  }
`;
document.head.appendChild(style);

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
      className={`relative flex flex-col items-center cursor-pointer group p-3 rounded-xl transition-all duration-300
        ${isActive ? 'bg-blue-600/20' : 'hover:bg-white/10'} 
        nav-float hover:shadow-lg hover:shadow-blue-500/10 
        active:scale-95 active:shadow-inner active:bg-blue-700/30`}
      onClick={handleNavigation}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleNavigation()}
    >
      {/* Image Icon with enhanced states */}
      <div className={`relative ${isActive ? 'nav-pulse' : ''}`}>
        <div className={`p-1 rounded-lg transition-transform duration-200 ${isActive ? 'transform scale-110' : 'group-hover:scale-105'}`}>
          <img 
            src={icon} 
            alt={label} 
            className={`h-8 w-8 transition-all duration-300 
              ${isActive ? 'filter brightness-110' : 'group-hover:brightness-110 group-hover:rotate-[5deg]'}`}
          />
        </div>
        
        {/* Active indicator glow effect */}
        {isActive && (
          <div className="absolute inset-0 bg-blue-400/20 blur-md rounded-full -z-10 animate-pulse"></div>
        )}
      </div>
      
      {/* Label with enhanced active state */}
      <span className={`text-xs mt-2 transition-all duration-200 
        ${isActive ? 'text-blue-300 font-medium' : 'text-gray-300 group-hover:text-white group-hover:translate-y-0.5'}`}>
        {label}
      </span>
      
      {/* Active indicator line with animation */}
      {isActive && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-400 rounded-r-full animate-pulse"></div>
      )}
      
      {/* Animated tooltip on hover */}
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10 transform translate-x-0 group-hover:translate-x-1">
        {label}
      </div>
    </div>
  );
};

export default AdminNavigationBar;
