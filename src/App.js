console.log("App רונדר");

import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, NavLink } from "react-router-dom";
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

  // מאזין למצב התחברות
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
              style={{ height: 32, verticalAlign: "middle", marginLeft: 10 }}
            />
            Time Tracking App
          </div>
          {user && (
            <div className="header-buttons">
              {isAdmin && (
                <>
                  <NavLink to="/admin" className="btn btn-nav" activeclassname="active">
                    קטגוריות
                  </NavLink>
                  <NavLink to="/users" className="btn btn-nav" activeclassname="active">
                    משתמשים
                  </NavLink>
                </>
              )}
              <button
                className="btn btn-logout"
                onClick={() => {
                  setUser(null);
                  setIsAdmin(false);
                  localStorage.clear();
                }}
              >
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
