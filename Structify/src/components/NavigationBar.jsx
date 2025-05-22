import React from "react";
import { useNavigate } from "react-router-dom";
import CodeIcon from "../assets/images/Code Icon.png";
import LeaderboardIcon from "../assets/images/Leaderboard Icon.png";
import LearnIcon from "../assets/images/Learn Icon.png";
import PvPIcon from "../assets/images/PvP Icon.png";
import ForumIcon from "../assets/images/Forum Icon.png";

const NavigationBar = () => {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-[#1F274D] flex justify-around items-center py-2 px-2 border-t border-gray-200 z-50
                 sm:py-3 sm:px-4
                 md:top-0 md:bottom-auto md:left-0 md:right-auto md:h-screen md:w-22 md:flex-col md:justify-start md:items-center md:py-8 md:space-y-8 md:border-t-0 md:border-r md:border-gray-200"
    >
      {/* Navigation Icons */}
      <nav className="flex w-100 justify-around md:flex-col md:space-y-8 md:justify-start">
        <NavItem to="/mainPage" icon={LearnIcon} label="Learn" />
        <NavItem to="/codePlayground" icon={CodeIcon} label="Code" />
        <NavItem to="/Leaderboard" icon={LeaderboardIcon} label="Leaderboard" />
        <NavItem to="/CodeChallengeLobby" icon={PvPIcon} label="PvP" />
        <NavItem to="/Forum" icon={ForumIcon} label="Forum" />
      </nav>
    </div>
  );
};

// Reusable Navigation Item Component with navigation path
const NavItem = ({ to, icon, label }) => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate(to);
  };

  return (
    <div
      className="flex flex-col items-center cursor-pointer group p-1 sm:p-2 md:p-3"
      onClick={handleNavigation}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleNavigation()}
    >
      <img
        src={icon}
        alt={label}
        className="h-8 w-9 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-9 group-hover:opacity-75 transition-opacity"
      />
      <span className="text-white text-[8px] sm:text-[9px] mt-1 md:text-xs md:mt-2 hidden md:block">{label}</span>
    </div>
  );
};

export default NavigationBar;