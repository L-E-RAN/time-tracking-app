// src/UserManagementPanel.js
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

export default function UserManagementPanel({ onBack }) {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAdmin = async (user) => {
    const ref = doc(db, "users", user.id);
    await updateDoc(ref, { isAdmin: !user.isAdmin });
    fetchUsers();
  };

  const deleteUser = async (user) => {
    if (!window.confirm("למחוק את המשתמש הזה?")) return;
    await deleteDoc(doc(db, "users", user.id));
    fetchUsers();
  };

  return (
    <div className="container">
      <h2>ניהול משתמשים</h2>
      <button className="btn btn-primary" onClick={onBack}>חזור</button>

      <ul style={{ marginTop: 20 }}>
        {users.map(user => (
          <li key={user.id}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span><strong>{user.email}</strong></span>
              <span>הרשאות ניהול: {user.isAdmin ? "✔️ כן" : "❌ לא"}</span>
              <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
                <button className="btn btn-login" onClick={() => toggleAdmin(user)}>
                  שנה הרשאות ניהול
                </button>
                <button className="btn btn-primary" style={{ backgroundColor: '#dc3545' }} onClick={() => deleteUser(user)}>
                  מחק משתמש
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
