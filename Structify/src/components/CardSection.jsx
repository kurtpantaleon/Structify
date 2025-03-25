import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CardSection({ title, subtitle, progress, path, mediaSrc, mediaAlt = 'Card visual', mediaType = 'image' }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    navigate(path);
  };

  return (
    <div
      className={`relative w-83 h-55 rounded-xl border-2 border-white flex flex-col justify-between bg-gradient-to-r ${
        isHovered ? 'from-[#6a74db] to-[#30418B]' : 'from-[#30418B] to-[#1F274D]'
      } cursor-pointer transition-all transform ${isHovered ? 'scale-105' : 'scale-100'}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-40 overflow-hidden rounded-t-xl">
        {mediaType === 'video' ? (
          mediaSrc ? (
            <video
              src={mediaSrc}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white">
              No Video
            </div>
          )
        ) : (
          <img
            src={mediaSrc || 'https://via.placeholder.com/300x150?text=No+Image'}
            alt={mediaAlt}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      <div className="h-20 border-t-2 border-white p-2 rounded-b-xl bg-[#1F274D]">
        <h3 className="text-white font-bold text-base truncate">{title}</h3>
        <div className='flex justify-between items-center text-white'>
          <span className='font-light text-sm truncate'>{subtitle}</span>
          <div className="w-16 h-2 bg-gray-400 rounded-full">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardSection;