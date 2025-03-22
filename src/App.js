import React, { useState } from "react";
import AuthForm from "./AuthForm";
import TaskTracker from "./TaskTracker";
import "./style.css"; // ✅ חיבור קובץ העיצוב

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return (
      <div className="container">
        <AuthForm onLogin={(u) => setUser(u)} />
      </div>
    );
  }

  return (
    <div className="container">
      <h1>ברוך הבא {user.email}</h1>
      <button onClick={() => setUser(null)}>Logout</button>
      <TaskTracker user={user} />
    </div>
  );
}

export default App;
