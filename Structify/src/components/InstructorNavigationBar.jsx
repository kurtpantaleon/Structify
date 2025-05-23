import React from "react";
import { useNavigate } from "react-router-dom";
import HomeIcon from "../assets/images/Home Icon.png"; 
import Leaderboard from "../assets/images/Leaderboard Icon.png";
import PvPIcon from "../assets/images/PvP Icon.png";
import ForumIcon from "../assets/images/Forum Icon.png"; 
import AddIcon from "../assets/images/Add Icon.png";
import ClassFieldIcon from "../assets/images/Instructor Materials Icon.png";
import { useAuth } from "../context/authContextProvider";

const InstructorNavigationBar = () => {
  return (
    <div className="fixed bg-[#1F274D] h-screen w-22 flex flex-col items-center py-8 px-1 border-gray-200">
      {/* Navigation Icons */}
      <nav className="flex flex-col space-y-8 gap-y-3">
        <NavItem to="/InstructorPage" icon={HomeIcon} label="Home" />
        <NavItem to="/Leaderboard" icon={Leaderboard} label="Leaderboard" />
        <NavItem to="/CodeChallengeLobby" icon={PvPIcon} label="PvP" /> 
        <NavItem to="/Forum" icon={ForumIcon} label="Forum" />
        <NavItem to="/AddLessonMaterials" icon={AddIcon} label="Add" />
        <NavItem to="/ClassField" icon={ClassFieldIcon} label="Class Field" />
      </nav>
    </div>
  );
};

// Reusable Navigation Item Component with navigation path
const NavItem = ({ to, icon, label }) => {
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
    <div className="flex flex-col items-center cursor-pointer group" onClick={handleNavigation}>
      <img src={icon} alt={label} className="h-9 w-9 group-hover:opacity-75 transition-opacity" />
      <span className="text-white text-xs mt-1">{label}</span>
    </div>
  );
};

export default InstructorNavigationBar;
