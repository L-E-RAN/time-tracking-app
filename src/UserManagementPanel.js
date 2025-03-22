// UserManagementPanel.js - כולל חיפוש לפי שם או מייל
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
  const [search, setSearch] = useState("");

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

  const filteredUsers = users.filter(user => {
    const keyword = search.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(keyword)) ||
      (user.email && user.email.toLowerCase().includes(keyword))
    );
  });

  return (
    <div className="container">
      <h2 style={{ textAlign: "center" }}>ניהול משתמשים</h2>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={onBack}>חזור</button>
      </div>

      <div style={{ maxWidth: 400, margin: "0 auto", marginBottom: 20 }}>
        <input
          type="text"
          placeholder="חפש לפי שם או אימייל..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: 8, borderRadius: 6 }}
        />
      </div>

      <ul style={{ maxWidth: 600, margin: "0 auto", padding: 0 }}>
        {filteredUsers.map(user => (
          <li
            key={user.id}
            style={{
              background: "#f0f2f5",
              borderRadius: 12,
              padding: 15,
              marginBottom: 12,
              listStyle: "none",
              boxShadow: "0 0 6px rgba(0,0,0,0.08)"
            }}
          >
            {editId === user.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ marginBottom: 8 }}
                />
                <button className="btn btn-login" onClick={saveEdit}>שמור שם</button>
              </>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span><strong>{user.name || "[ללא שם]"}</strong></span>
                  <span>אימייל: {user.email || "[לא ידוע]"}</span>
                  <span>הרשאות ניהול: {user.isAdmin ? "✔️ כן" : "❌ לא"}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                  <button className="btn btn-login" onClick={() => toggleAdmin(user)}>
                    שנה הרשאות ניהול
                  </button>
                  <button className="btn btn-login" onClick={() => startEdit(user)}>
                    ערוך שם
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ backgroundColor: '#dc3545' }}
                    onClick={() => deleteUser(user)}
                  >
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
