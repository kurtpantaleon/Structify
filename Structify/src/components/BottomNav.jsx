import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Book, Code, Trophy, Swords, MessageCircle, FolderArchive } from "lucide-react";

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: "/mainPage", icon: Book, label: "Learn" },
    { to: "/codePlayground", icon: Code, label: "Playground" },
    { to: "/Leaderboard", icon: Trophy, label: "Leaderboard" },
    { to: "/CodeChallengeLobby", icon: Swords, label: "PvP" },
    { to: "/Forum", icon: MessageCircle, label: "Forum" },
    { to: "/ClassField", icon: FolderArchive, label: "Uploads" }
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#1a2045] to-[#1F274D] flex justify-around items-center h-16 border-t border-indigo-900/40 shadow-[0_-2px_10px_rgba(0,0,0,0.15)] md:hidden">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to === '/mainPage' && location.pathname === '/') ||
            (item.to !== '/mainPage' && location.pathname.startsWith(item.to));
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`relative flex flex-col items-center justify-center group transition-all duration-200
                ${isActive ? 'text-blue-400' : 'text-gray-300 hover:text-white'}
                p-1.5 sm:p-2 rounded-xl`}
              style={{ outline: "none", background: "none", border: "none" }}
              aria-label={item.label}
            >
              <item.icon
                className={`h-6 w-6 transition-all duration-200
                  ${isActive ? 'stroke-blue-400' : 'stroke-gray-300 group-hover:stroke-white'}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={`text-[9px] mt-1 transition-all duration-200 ${isActive ? 'font-medium' : 'font-normal'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"></span>
              )}
            </button>
          );
        })}
      </nav>
      {/* Spacer to prevent content from being hidden behind BottomNav */}
      <div className="h-16 md:hidden" aria-hidden="true"></div>
    </>
  )
}

export default BottomNav