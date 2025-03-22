// App.js - כולל ניתוב עם React Router
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import AuthForm from "./AuthForm";
import TaskTracker from "./TaskTracker";
import AdminPanel from "./AdminPanel";
import "./style.css";

function App() {
  const [user, setUser] = useState(null);
  const isAdmin = user && user.email === "eliran@example.com"; // שנה למייל שלך

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
              <button className="logout-btn" onClick={() => setUser(null)}>
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
