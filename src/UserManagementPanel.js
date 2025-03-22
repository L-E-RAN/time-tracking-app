// UserManagementPanel.js - מציג שם המשתמש, וכולל אפשרות לערוך שם
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
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

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

  const startEdit = (user) => {
    setEditId(user.id);
    setEditName(user.name || "");
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;
    const ref = doc(db, "users", editId);
    await updateDoc(ref, { name: editName.trim() });
    setEditId(null);
    fetchUsers();
  };

  return (
    <div className="container">
      <h2>ניהול משתמשים</h2>
      <button className="btn btn-primary" onClick={onBack}>חזור</button>

      <ul style={{ marginTop: 20 }}>
        {users.map(user => (
          <li key={user.id}>
            {editId === user.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button className="btn btn-login" onClick={saveEdit}>שמור שם</button>
              </>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span><strong>{user.name || user.email}</strong></span>
                  <span>אימייל: {user.email}</span>
                  <span>הרשאות ניהול: {user.isAdmin ? "✔️ כן" : "❌ לא"}</span>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
                  <button className="btn btn-login" onClick={() => toggleAdmin(user)}>
                    שנה הרשאות ניהול
                  </button>
                  <button className="btn btn-login" onClick={() => startEdit(user)}>
                    ערוך שם
                  </button>
                  <button className="btn btn-primary" style={{ backgroundColor: '#dc3545' }} onClick={() => deleteUser(user)}>
                    מחק משתמש
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
