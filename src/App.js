import React, { useState } from "react";
import AuthForm from "./AuthForm";
import TaskTracker from "./TaskTracker";
import "./style.css";

function App() {
  const [user, setUser] = useState(null);

  return (
    <>
      <header>
        <img src="/logo192.png" alt="Logo" style={{ height: 32, verticalAlign: "middle", marginRight: 10 }} />
        Time Tracking App
      </header>
      <main>
        {!user ? (
          <div className="container">
            <AuthForm onLogin={(u) => setUser(u)} />
          </div>
        ) : (
          <div className="container">
            <h1>המשימות היומיות שלך</h1>
            <button onClick={() => setUser(null)}>Logout</button>
            <TaskTracker user={user} />
          </div>
        )}
      </main>
    </>
  );
}

export default App;
