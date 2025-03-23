import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

export default function UserManagementPanel({ onBack }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(data);
      } catch (error) {
        console.error("שגיאה בטעינת משתמשים:", error);
      }
    };

    fetchUsers();
  }, []);

  const toggleAdmin = async (id, current) => {
    try {
      await updateDoc(doc(db, "users", id), { isAdmin: !current });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, isAdmin: !current } : u
        )
      );
    } catch (error) {
      console.error("שגיאה בעדכון הרשאות:", error);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("האם למחוק את המשתמש?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      setUsers(users.filter((u) => u.id !== id));
    } catch (error) {
      console.error("שגיאה במחיקת משתמש:", error);
    }
  };

  return (
    <div className="container">
      <h2>ניהול משתמשים</h2>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
        <thead>
          <tr>
            <th>אימייל</th>
            <th>הרשאת מנהל</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.isAdmin ? "✔️" : "❌"}</td>
              <td>
                <button
                  className="btn btn-login"
                  onClick={() => toggleAdmin(u.id, u.isAdmin)}
                >
                  שנה הרשאה
                </button>
                <button
                  className="btn btn-primary"
                  style={{ marginInlineStart: 8 }}
                  onClick={() => deleteUser(u.id)}
                >
                  מחק
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={onBack} className="btn btn-primary" style={{ marginTop: 30 }}>
        חזור
      </button>
    </div>
  );
}
