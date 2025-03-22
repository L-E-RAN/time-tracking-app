import React, { useState } from "react";
import AuthForm from "./AuthForm";
import TaskTracker from "./TaskTracker";
import "./style.css";

function App() {
  const [user, setUser] = useState(null);

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
            <button className="logout-btn" onClick={() => setUser(null)}>
              התנתקות
            </button>
          )}
        </div>
      </header>

      <main>
        {!user ? (
          <div className="container">
            <AuthForm onLogin={(u) => setUser(u)} />
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
