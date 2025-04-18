import { useEffect, useReducer, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../services/firebaseConfig";
import { AuthContext } from "./authContext";
import authReducer from "./authReducer";
import LoadingCircle from "../components/LoadingCircle";
import { useContext } from "react"; // ADD THIS

const INITIAL_STATE = {
  currentUser: null,
  role: null,
};

function AuthContextProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, INITIAL_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          const userRole = docSnap.exists() ? docSnap.data().role : null;

          dispatch({
            type: "LOGIN",
            payload: {
              user: {
                uid: user.uid,
                email: user.email,
                name: docSnap.data().name,
                section: docSnap.data().section,
              },
              role: userRole,
            },
          });

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

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingCircle />;
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser: state.currentUser,
        role: state.role,
        loading,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;

// ✅ ADD THIS BELOW:
export function useAuth() {
  return useContext(AuthContext);
}
