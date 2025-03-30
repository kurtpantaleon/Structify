import React from "react";
import { useNavigate } from "react-router-dom"; // Importing useNavigate
import HomeIcon from "../assets/images/Home Icon.png"; 
import InstructorIcon from "../assets/images/Instructor Icon.png"; 
import StudentIcon from "../assets/images/Student Icon.png"; 

const AdminNavigationBar = () => {
  return (
    <div className="fixed bg-[#1F274D] h-screen w-20 flex flex-col items-center py-8 space-y-8 px-1 border-r-1 border-gray-200">
      {/* Navigation Icons */}
      <nav className="flex flex-col space-y-8">
        <NavItem to="/" icon={HomeIcon} label="Home" />
        <NavItem to="/" icon={InstructorIcon} label="Instructor" />
        <NavItem to="/" icon={StudentIcon} label="Student" /> 
        {/* Optionally, you can add more NavItems as needed */}
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

export default AdminNavigationBar;
