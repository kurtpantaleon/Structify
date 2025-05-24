// src/components/BackgroundSound.jsx
import { useEffect, useState } from 'react';
import backgroundMusic from '../assets/sounds/background.mp3';

// Create a persistent audio instance
const audio = new Audio(backgroundMusic);
audio.loop = true;
audio.volume = 0.3;

function BackgroundSound() {
  const [isPlaying, setIsPlaying] = useState(true); // default to playing

  useEffect(() => {
    const startAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Autoplay blocked by browser:', err);
        setIsPlaying(false);
      }
    };

    startAudio();

    return () => {
      audio.pause();
    };
  }, []);

  const toggleAudio = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);

    if (newState) {
      audio.play().catch(err => {
        console.warn('Failed to play:', err);
      });
    } else {
      audio.pause();
    }
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
