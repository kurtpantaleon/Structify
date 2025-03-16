import React from 'react';

function WeekButton({ status, icon, title, iconType }) {
  return (
    <button className="flex items-center justify-between w-full px-4 py-4.5 bg-[#1F274D] rounded-lg border border-white/100 text-white cursor-pointer">
      {/* Left: Icon + Title */}
      <div className="flex items-center space-x-3">
        <img src={iconType} alt={title} className="w-8 h-6" />
        <span className="font-semibold">{title}</span>
      </div>

      {/* Right: Status + Check Icon */}
      <div className="flex items-center space-x-2 text-xs">
        <span className="border border-white/100 px-4 py-1 rounded-lg min-w-[100px] text-center">
          {status}
        </span>
        <img src={icon} alt={status} className="w-5 h-5" />
      </div>
    </button>
  )
}

export default WeekButton