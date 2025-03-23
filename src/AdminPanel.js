// App.js - הרשאות ניהול מבוססות Firestore + ניתוב עם React Router
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import AuthForm from "./AuthForm";
import TaskTracker from "./TaskTracker";
import AdminPanel from "./AdminPanel";
import "./style.css";

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setIsAdmin(data.isAdmin === true);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);

}

export default App;
