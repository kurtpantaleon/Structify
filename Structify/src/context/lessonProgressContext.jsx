import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebaseConfig";
import { useGameStats } from "../context/gameStatsContext";
 
const LessonProgressContext = createContext();

export const useLessonProgress = () => useContext(LessonProgressContext);

export const LessonProgressProvider = ({ children }) => {
  const [user] = useAuthState(auth);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [activityScores, setActivityScores] = useState({});
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const { addCoins } = useGameStats();

  useEffect(() => {
    const fetchProgress = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCompletedLessons(data.completedLessons || []);
          setCompletedActivities(data.completedActivities || []);
          setActivityScores(data.activityScores || {});
          setCompletedQuizzes(data.completedQuizzes || []);
        }
      }
    };
    fetchProgress();
  }, [user]);

  const markLessonComplete = async (lessonId) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      completedLessons: arrayUnion(lessonId)
    });
    setCompletedLessons((prev) => [...new Set([...prev, lessonId])]);
    await addCoins(1);
  };

  const markActivityComplete = async (activityId, score = null) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    const updateData = {
      completedActivities: arrayUnion(activityId)
    };

    if (score !== null) {
      updateData[`activityScores.${activityId}`] = score;
    }

    await updateDoc(userRef, updateData);

    setCompletedActivities((prev) => [...new Set([...prev, activityId])]);
    if (score !== null) {
      setActivityScores((prev) => ({ ...prev, [activityId]: score }));
    }
  };

  const markQuizComplete = async (quizId) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      completedQuizzes: arrayUnion(quizId)
    });
    setCompletedQuizzes((prev) => [...new Set([...prev, quizId])]);
  };

  return (
    <LessonProgressContext.Provider
      value={{
        completedLessons,
        markLessonComplete,
        completedActivities,
        activityScores,
        markActivityComplete,
        completedQuizzes,
        markQuizComplete
      }}
    >
      {children}
    </LessonProgressContext.Provider>
  );
};
