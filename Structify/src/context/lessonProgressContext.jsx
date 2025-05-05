import React, { createContext, useContext, useState } from 'react';

const LessonProgressContext = createContext();

export const LessonProgressProvider = ({ children }) => {
  const [completedLessons, setCompletedLessons] = useState([]);

  const markLessonComplete = (lessonId) => {
    setCompletedLessons((prev) => [...new Set([...prev, lessonId])]);
  };

  return (
    <LessonProgressContext.Provider value={{ completedLessons, markLessonComplete }}>
      {children}
    </LessonProgressContext.Provider>
  );
};

export const useLessonProgress = () => useContext(LessonProgressContext);
