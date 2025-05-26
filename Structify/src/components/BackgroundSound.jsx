// src/components/BackgroundSound.jsx
import React, { useEffect, useRef, useState } from 'react';
import backgroundMusic from '../assets/sounds/background.mp3';

export default function BackgroundSound() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(backgroundMusic);
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startAudio = async () => {
    try {
      if (audioRef.current && !isPlaying) {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  };

  // Add click handler to the document to start audio
  useEffect(() => {
    const handleFirstInteraction = () => {
      startAudio();
      // Remove the event listeners after first interaction
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [isPlaying]);

  return null; // This component doesn't render anything
}
