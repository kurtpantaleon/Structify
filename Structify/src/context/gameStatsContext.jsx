import React, { createContext, useContext, useEffect, useState } from "react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const GameStatsContext = createContext();

export function useGameStats() {
  return useContext(GameStatsContext);
}
 
export function GameStatsProvider({ children }) {
  const [stats, setStats] = useState({ hearts: 0, coins: 0, rankPoints: 0 });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!userId) return;
    const db = getFirestore();
    const userRef = doc(db, "users", userId);
    getDoc(userRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStats({
          hearts: data.hearts ?? 0,
          coins: data.coins ?? 0,
          rankPoints: data.rankPoints ?? 0,
        });
      }
    });
  }, [userId]);

  // Update stats in Firestore and local state
  const updateStats = async (newStats) => {
    if (!userId) return;
    const db = getFirestore();
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, newStats);
    setStats((prev) => ({ ...prev, ...newStats }));
  };

  // Deduct heart utility
  const deductHeart = async () => {
    if (stats.hearts > 0) {
      await updateStats({ hearts: stats.hearts - 1 });
    }
  };

  // Add coin utility
  const addCoins = async (amount) => {
    await updateStats({ coins: stats.coins + amount });
  };

  // Add rank points utility
  const addRankPoints = async (amount) => {
    await updateStats({ rankPoints: stats.rankPoints + amount });
  };

  return (
    <GameStatsContext.Provider
      value={{
        ...stats,
        updateStats,
        deductHeart,
        addCoins,
        addRankPoints,
        reloadStats: () => setUserId(userId), // force reload
      }}
    >
      {children}
    </GameStatsContext.Provider>
  );
}