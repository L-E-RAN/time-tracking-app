// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔁 החלף את הנתונים כאן בנתונים שלך:
const firebaseConfig = {
    apiKey: "AIzaSyBwqVCugFZRrCCQTA34d_aQF3ztCutbgHg",
    authDomain: "time-tracking-app-55ea9.firebaseapp.com",
    projectId: "time-tracking-app-55ea9",
    storageBucket: "time-tracking-app-55ea9.firebasestorage.app",
    messagingSenderId: "287190037467",
    appId: "1:287190037467:web:357a24adc689688ee4adfe",
    measurementId: "G-XF0MG8NQ9Y"
};

// אתחול האפליקציה
const app = initializeApp(firebaseConfig);

// יצוא auth ו־db לשימוש בשאר הפרויקט
export const auth = getAuth(app);
export const db = getFirestore(app);
