import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Book, Code, Trophy, Swords, MessageCircle, FolderArchive } from "lucide-react";
import { useAuth } from "../context/authContextProvider";

const NavigationBar = () => {
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

  // Navigation items configuration
  const navItems = [
    { to: "/mainPage", icon: Book, label: "Learn" },
    { to: "/codePlayground", icon: Code, label: "Code Playground" },
    { to: "/Leaderboard", icon: Trophy, label: "Leaderboard" },
    { to: "/CodeChallengeLobby", icon: Swords, label: "PvP" },
    { to: "/Forum", icon: MessageCircle, label: "Forum" },
    { to: "/ClassField", icon: FolderArchive, label: "Class Uploads" }
  ];

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-in-out
        ${expanded ? 'md:w-[5.5rem]' : 'md:w-16'} 
        
        bottom-0 left-0 right-0 bg-gradient-to-r from-[#1a2045] to-[#1F274D] 
        flex justify-around items-center py-2 px-2 border-t border-indigo-900/40
        shadow-[0_-2px_10px_rgba(0,0,0,0.15)]
        
        sm:py-3 sm:px-4
        md:top-0 md:bottom-auto md:left-0 md:right-auto md:h-screen 
        md:flex-col md:justify-start md:items-center md:py-8 md:space-y-6 md:border-t-0 md:border-r 
        md:shadow-[5px_0_15px_rgba(0,0,0,0.1)]`}
      onMouseEnter={() => window.innerWidth >= 768 && setExpanded(true)}
      onMouseLeave={() => window.innerWidth >= 768 && setExpanded(false)}
    >
      {/* App logo for desktop
      <div className="hidden md:flex md:items-center md:justify-center md:mb-6">
        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
          S
        </div>
      </div> */}

      {/* Navigation Icons */}
      <nav className="flex w-full justify-around md:flex-col md:space-y-1 md:justify-start">
        {navItems.map((item) => (
          <NavItem 
            key={item.to}
            to={item.to} 
            Icon={item.icon} 
            label={item.label} 
            isActive={location.pathname === item.to || 
              (item.to === '/mainPage' && location.pathname === '/') ||
              (item.to !== '/mainPage' && location.pathname.startsWith(item.to))}
            expanded={expanded}
          />
        ))}
      </nav>
    </div>
  );
};

// Reusable Navigation Item Component with navigation path
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
      className={`relative flex flex-col items-center cursor-pointer group transition-all duration-200
        ${isActive ? 'md:translate-x-1' : 'hover:md:translate-x-0.5'}
        p-1.5 sm:p-2 md:p-3 md:mb-1 rounded-xl 
        ${isActive ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300 hover:text-white'}`}
      onClick={handleNavigation}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleNavigation()}
    >
      {/* Icon */}
      <Icon 
        className={`h-6 w-6 sm:h-6 sm:w-6 md:h-6 md:w-6 transition-all duration-200
          ${isActive ? 'stroke-blue-400' : 'stroke-gray-300 group-hover:stroke-white'}`}
        strokeWidth={isActive ? 2.5 : 1.8}
      />
      
      {/* Label */}
      <span 
        className={`text-center text-[8px] sm:text-[9px] mt-1 md:text-xs md:mt-1.5
          transition-all duration-200
          ${isActive ? 'font-medium' : 'font-normal'}
          ${expanded ? 'md:opacity-100 md:max-h-8' : 'md:opacity-0 md:max-h-0 md:overflow-hidden'}`}
      >
        {label}
      </span>
      
      {/* Active indicator */}
      {isActive && (
        <>
          {/* Mobile indicator (dot at bottom) */}
          <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full md:hidden"></span>
          
          {/* Desktop indicator (line at left) */}
          <span className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r"></span>
        </>
      )}
      
      {/* Tooltip for collapsed state on desktop */}
      {!expanded && (
        <div className="hidden md:block absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {label}
        </div>
      )}
    </div>
  );
};

export default NavigationBar;