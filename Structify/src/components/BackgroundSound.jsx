// src/components/BackgroundSound.jsx
import { useEffect, useState } from 'react';
import backgroundMusic from '../assets/sounds/background.mp3';

// Create a persistent audio object (singleton)
const audio = new Audio(backgroundMusic);
audio.loop = true;
audio.volume = 0.3;

function BackgroundSound() {
  const [isPlaying, setIsPlaying] = useState(() => {
    // Try to retrieve last state from localStorage
    return localStorage.getItem('isPlaying') === 'true';
  });

  useEffect(() => {
    if (isPlaying) {
      audio.play().catch((err) => {
        console.warn('Autoplay blocked:', err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }

    return () => {
      // Pause when component unmounts to prevent duplication
      audio.pause();
    };
  }, [isPlaying]);

  const toggleAudio = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.warn('Autoplay blocked:', err);
      });
    }

    const newState = !isPlaying;
    setIsPlaying(newState);
    localStorage.setItem('isPlaying', newState.toString());
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
