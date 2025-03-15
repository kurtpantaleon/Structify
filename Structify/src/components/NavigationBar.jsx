import React from "react";
import CodeIcon from "../assets/images/Code Icon.png";
import LeaderboardIcon from "../assets/images/Leaderboard Icon.png";
import ProfileIcon from "../assets/images/sample profile.png";
import LearnIcon from "../assets/images/Learn Icon.png";
import PvPIcon from "../assets/images/PvP Icon.png";

const NavigationBar = () => {
  return (
    <div className="bg-[#1F274D] h-screen w-20 flex flex-col items-center py-8 space-y-8 px-1">
      {/* Navigation Icons */}
      <nav className="flex flex-col space-y-8">
        <NavItem icon={LearnIcon} label="Learn" />
        <NavItem icon={CodeIcon} label="Code" />
        <NavItem icon={PvPIcon} label="PvP" />
        <NavItem icon={LeaderboardIcon} label="Ranks" />
        <NavItem icon={ProfileIcon} label="Profile" />
      </nav>
    </div>
  );
};

// Reusable Navigation Item Component
const NavItem = ({ icon, label }) => (
  <div className="flex flex-col items-center cursor-pointer group">
    <img src={icon} alt={label} className="h-8 w-9 group-hover:opacity-75 transition-opacity" />
    <span className="text-white text-xs mt-1">{label}</span>
  </div>
);

export default NavigationBar;
