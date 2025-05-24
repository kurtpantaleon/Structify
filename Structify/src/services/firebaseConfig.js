import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, deleteUser } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config (Vite-style)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: "structify-f712f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// ✅ Initialize primary app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
 
// ✅ Initialize secondary app for isolated user creation
const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
export const secondaryAuth = getAuth(secondaryApp);

/**
 * Delete a Firebase Authentication user by their email
 * This function allows reusing emails after user deletion
 * 
 * @param {string} email - The email of the user to delete
 * @param {string} password - The password for the account (if available)
 * @param {string} userId - The Firebase Auth UID (optional if email/password provided)
 * @returns {Promise<boolean>} - True if deletion succeeded, false otherwise
 */
export const adminDeleteUser = async (email, password, userId = null) => {
  try {
    // If we have an email and password, sign in to get the auth record
    if (email && password) {
      const userCredential = await signInWithEmailAndPassword(secondaryAuth, email, password);
      if (userCredential?.user) {
        await deleteUser(userCredential.user);
        return true;
      }
    } 
    
    // If we only have userId, use Firebase Admin SDK via a cloud function
    // This requires implementation of a backend function
    if (userId) {
      // Call the server endpoint that uses admin SDK to delete the user
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/deleteUser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
        
        if (response.ok) {
          return true;
        }
      } catch (apiError) {
        console.error('Error calling user deletion API:', apiError);
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting auth user:', error);
    return false;
  }
};
