// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Replace with your own Firebase config:
const firebaseConfig = {
    apiKey: "AIzaSyA7ATaebUS_yfZHbXQB4Z3C__h2hPM2quI",
    authDomain: "kundli-analyzer-basic.firebaseapp.com",
    projectId: "kundli-analyzer-basic",
    storageBucket: "kundli-analyzer-basic.firebasestorage.app",
    messagingSenderId: "908469184164",
    appId: "1:908469184164:web:38b58e6e0d966d5452e831"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


export { app };
