// src/context/AuthContextProvider.jsx

import { useEffect, useReducer } from "react";
import { getDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../services/firebaseConfig";
import { AuthContext } from "./authContext";
import authReducer from "./authReducer";

const INITIAL_STATE = {
  currentUser: null,
  role: null,
};

function AuthContextProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, INITIAL_STATE);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          const userRole = docSnap.exists() ? docSnap.data().role : null;

          dispatch({ type: "LOGIN", payload: { user, role: userRole } });
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("role", userRole);
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        dispatch({ type: "LOGOUT" });
        localStorage.removeItem("user");
        localStorage.removeItem("role");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser: state.currentUser,
        role: state.role,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;
