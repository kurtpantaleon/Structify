// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "structify-f712f.firebaseapp.com",
  projectId: "structify-f712f",
  storageBucket: "structify-f712f.firebasestorage.app",
  messagingSenderId: "857880871867",
  appId: "1:857880871867:web:bd8463912c0e97f0027a9e",
  measurementId: "G-WY0D82R92E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);