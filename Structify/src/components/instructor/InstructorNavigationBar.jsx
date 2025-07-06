import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Trophy, MessageCircle, Upload, FolderOpen } from "lucide-react";
import { useAuth } from "../../context/authContextProvider";

const InstructorNavigationBar = () => {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  
  // Auto-expand on desktop
  useEffect(() => {
    const handleResize = () => {
      setExpanded(window.innerWidth >= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Navigation items configuration with Lucide icons
  const navItems = [
    { to: "/InstructorPage", icon: Home, label: "Home" },
    { to: "/Leaderboard", icon: Trophy, label: "Leaderboard" },
    { to: "/Forum", icon: MessageCircle, label: "Forum" },
    { to: "/AddLessonMaterials", icon: Upload, label: "Upload Materials" },
    { to: "/ClassField", icon: FolderOpen, label: "Class Uploads" },
  ];

  return (
    <div 
      className={`fixed bg-gradient-to-b from-[#1a2045] to-[#1F274D] h-screen 
        ${expanded ? 'w-[5.5rem]' : 'w-20'} 
        flex flex-col items-center py-8 px-1 border-r border-indigo-900/40 shadow-lg z-40
        transition-all duration-300 ease-in-out`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      
      {/* Navigation Icons */}
      <nav className="flex flex-col space-y-6">
        {navItems.map((item) => (
          <NavItem 
            key={item.to}
            to={item.to} 
            Icon={item.icon} 
            label={item.label} 
            isActive={location.pathname === item.to}
            expanded={expanded}
          />
        ))}
      </nav>
    </div>
  );
};

// Enhanced Navigation Item Component
const NavItem = ({ to, Icon, label, isActive, expanded }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();  

  const handleNavigation = () => {
    if (to === '/ClassField' && currentUser?.section) {
      navigate(to, { state: { section: currentUser.section } });
    } else {
      navigate(to);
    }
  };

  return (
    <div
      className={`relative w-full flex flex-col items-center cursor-pointer group transition-all duration-200
        py-2 px-1 rounded-xl 
        ${isActive ? 
          'bg-indigo-600/20 text-indigo-300' : 
          'text-gray-300 hover:text-white hover:bg-white/10'}`}
      onClick={handleNavigation}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleNavigation()}
    >
      {/* Icon */}
      <Icon 
        className={`h-6 w-6 transition-transform duration-200 group-hover:scale-110
          ${isActive ? 'stroke-indigo-300' : 'stroke-gray-300 group-hover:stroke-white'}`}
        strokeWidth={isActive ? 2.5 : 1.8}
      />
      
      {/* Label with conditional rendering based on expanded state */}
      <span 
        className={`text-center text-xs mt-1.5 transition-all duration-200
          ${isActive ? 'font-medium' : 'font-normal'}
          ${expanded ? 'opacity-100 max-h-8' : 'opacity-0 max-h-0 overflow-hidden'}`}
      >
        {label}
      </span>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full"></div>
      )}
      
      {/* Tooltip for collapsed state */}
      <div className={`absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap 
        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50
        ${expanded ? 'hidden' : 'block'}`}>
        {label}
      </div>
    </div>
  );
};

export default InstructorNavigationBar;
