import { createContext, useEffect, useReducer } from "react";
import { getDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../services/firebaseConfig"; // adjust as needed
import authReducer from "./authReducer";

const INITIAL_STATE = {
  currentUser: JSON.parse(localStorage.getItem("user")) || null,
  role: localStorage.getItem("role") || null,
};

const AuthContext = createContext();

function AuthContextProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, INITIAL_STATE);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        const userRole = docSnap.exists() ? docSnap.data().role : null;

        dispatch({
          type: "LOGIN",
          payload: { user, role: userRole },
        });

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", userRole);
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

// ✅ Default export = consistent with Vite HMR expectations
export default AuthContextProvider;

// ✅ Named export for context usage
export { AuthContext };
