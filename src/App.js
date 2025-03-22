import TaskTracker from "./TaskTracker";

// src/App.js
import React, { useState } from "react";
import AuthForm from "./AuthForm";

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <AuthForm onLogin={(u) => setUser(u)} />;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>ברוך הבא {user.email}</h1>
      <button onClick={() => setUser(null)}>Logout</button>
      {/* כאן נכניס את הדיווח משימות בהמשך */}
    </div>
  );
}

export default App;
