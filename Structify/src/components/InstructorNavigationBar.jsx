import React from "react";
import { useNavigate } from "react-router-dom";
import HomeIcon from "../assets/images/Home Icon.png"; 
import Leaderboard from "../assets/images/Leaderboard Icon.png";
import PvPIcon from "../assets/images/PvP Icon.png";

const InstructorNavigationBar = () => {
  return (
    <div className="fixed bg-[#1F274D] h-screen w-22 flex flex-col items-center py-8 space-y-8 px-1 border-r-1 border-gray-200">
      {/* Navigation Icons */}
      <nav className="flex flex-col space-y-8">
        <NavItem to="/InstructorPage" icon={HomeIcon} label="Home" />
        <NavItem to="" icon={Leaderboard} label="Leaderboard" />
        <NavItem to="" icon={PvPIcon} label="PvP" /> 
      </nav>
    </div>
  );
};

// Reusable Navigation Item Component with navigation path
const NavItem = ({ to, icon, label }) => {
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleNavigation = () => {
    navigate(to); // Navigate to the specified path
  };

  return (
    <div className="flex flex-col items-center cursor-pointer group" onClick={handleNavigation}>
      <img src={icon} alt={label} className="h-8 w-9 group-hover:opacity-75 transition-opacity" />
      <span className="text-white text-xs mt-1">{label}</span>
    </div>
  );
};

export default InstructorNavigationBar;
