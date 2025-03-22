// App.js - הרשאות ניהול מבוססות Firestore + ניתוב עם React Router
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
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

  return (
    <Router>
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <img
              src="/logo192.png"
              alt="Logo"
              style={{ height: 32, verticalAlign: "middle", marginLeft: 10 }}
            />
            Time Tracking App
          </div>
          {user && (
            <div style={{ display: "flex", gap: "10px" }}>
              {isAdmin && (
                <Link to="/admin" className="btn btn-login">ניהול קטגוריות</Link>
              )}
              <button className="logout-btn" onClick={() => { setUser(null); setIsAdmin(false); }}>
                התנתקות
              </button>
            </div>
          )}
        </div>
      </header>

      <main>
        <Routes>
          <Route
            path="/"
            element={
              !user ? (
                <div className="container">
                  <AuthForm onLogin={(u) => setUser(u)} />
                </div>
              ) : (
                <div className="container">
                  <TaskTracker user={user} />
                </div>
              )
            }
          />

          <Route
            path="/admin"
            element={
              user && isAdmin ? (
                <div className="container">
                  <AdminPanel user={user} onBack={() => window.history.back()} />
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
