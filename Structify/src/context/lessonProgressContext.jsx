// src/context/LessonProgressContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth"; // ✅ Not from firebase/auth
import { auth } from "../services/firebaseConfig"; // ✅ Correct


const LessonProgressContext = createContext();

export const useLessonProgress = () => useContext(LessonProgressContext);

export const LessonProgressProvider = ({ children }) => {
  const [user] = useAuthState(auth);
  const [completedLessons, setCompletedLessons] = useState([]);

  useEffect(() => {
    const fetchLessons = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setCompletedLessons(docSnap.data().completedLessons || []);
        }
      }
    };
    fetchLessons();
  }, [user]);

  const markLessonComplete = async (lessonId) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      completedLessons: arrayUnion(lessonId)
    });
    setCompletedLessons((prev) => [...new Set([...prev, lessonId])]);
  };

  return (
    <LessonProgressContext.Provider value={{ completedLessons, markLessonComplete }}>
      {children}
    </LessonProgressContext.Provider>
  );
};
