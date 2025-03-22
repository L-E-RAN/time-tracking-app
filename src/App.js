// App.js - כולל כפתור גישה ל־AdminPanel לפי מייל מנהל
import React, { useState } from "react";
import AuthForm from "./AuthForm";
import TaskTracker from "./TaskTracker";
import AdminPanel from "./AdminPanel";
import "./style.css";

function App() {
  const [user, setUser] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const isAdmin = user && user.email === "eliran.ashwal@gmail.com"; // שנה לפי המייל שלך

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
                <button className="btn btn-login" onClick={() => setShowAdmin(!showAdmin)}>
                  {showAdmin ? "חזור" : "ניהול קטגוריות"}
                </button>
              )}
              <button className="logout-btn" onClick={() => setUser(null)}>
                התנתקות
              </button>
            </div>
          )}
        </div>
      </header>

      <main>
        {!user ? (
          <div className="container">
            <AuthForm onLogin={(u) => setUser(u)} />
          </div>
        ) : showAdmin ? (
          <div className="container">
            <AdminPanel user={user} onBack={() => setShowAdmin(false)} />
          </div>
        ) : (
          <div className="container">
            <TaskTracker user={user} />
          </div>
        )}
      </main>
    </>
  );
}

export default App;
