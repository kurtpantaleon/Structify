// src/components/BackgroundSound.jsx
import { useEffect, useRef, useState } from 'react';
import backgroundMusic from '../assets/sounds/background.mp3';

function BackgroundSound() {
  const audioRef = useRef(new Audio(backgroundMusic));
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = 0.3;

    const play = async () => {
      try {
        await audio.play();
      } catch (err) {
        console.warn('Autoplay blocked:', err);
        setIsPlaying(false);
      }
    };

    play();

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <button
      onClick={toggleAudio}
      className="fixed bottom-4 right-4 z-50 p-3 bg-white text-black rounded-full shadow-md hover:bg-gray-200 focus:outline-none"
      aria-label={isPlaying ? 'Mute background music' : 'Play background music'}
    >
      {isPlaying ? '🎵' : '🔇'}
    </button>
  );
}

export default BackgroundSound;
