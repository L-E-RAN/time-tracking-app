// App.js
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "./firebase";
import AuthForm from "./AuthForm";
import TaskTracker from "./TaskTracker";
import AdminPanel from "./AdminPanel";
import UserManagementPanel from "./UserManagementPanel";
import "./style.css";

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // זיהוי משתמש מחובר (גם אחרי רענון)
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setIsAdmin(data.isAdmin === true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
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
                <>
                  <Link to="/admin" className="btn btn-login">קטגוריות</Link>
                  <Link to="/users" className="btn btn-login">משתמשים</Link>
                </>
              )}
              <button className="logout-btn" onClick={() => { setUser(null); setIsAdmin(false); localStorage.clear(); }}>
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
                <TaskTracker user={user} />
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

          <Route
            path="/users"
            element={
              user && isAdmin ? (
                <div className="container">
                  <UserManagementPanel onBack={() => window.history.back()} />
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default App;
