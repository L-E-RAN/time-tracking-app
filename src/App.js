import React, { useState } from "react";
import AuthForm from "./AuthForm";
import TaskTracker from "./TaskTracker";
import "./style.css";

function App() {
  const [user, setUser] = useState(null);

  return (
    <>
      <header>
        <img src="/logo192.png" alt="Logo" style={{ height: 24, marginRight: 10, verticalAlign: "middle" }} />
        Time Tracking App
      </header>
      <main>
        {!user ? (
          <div className="container">
            <AuthForm onLogin={(u) => setUser(u)} />
          </div>
        ) : (
          <div className="container">
            <h1>ברוך הבא {user.email}</h1>
            <button onClick={() => setUser(null)}>Logout</button>
            <TaskTracker user={user} />
          </div>
        )}
      </main>
    </>
  );
}

export default App;