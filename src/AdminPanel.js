// src/AdminPanel.js
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

export default function AdminPanel({ user, onBack }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, "categories"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    await addDoc(collection(db, "categories"), { name: newCategory.trim() });
    setNewCategory("");
    fetchCategories();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את הקטגוריה?")) return;
    await deleteDoc(doc(db, "categories", id));
    fetchCategories();
  };

  const startEdit = (cat) => {
    setEditId(cat.id);
    setEditValue(cat.name);
  };

  const saveEdit = async () => {
    if (!editValue.trim()) return;
    await updateDoc(doc(db, "categories", editId), { name: editValue.trim() });
    setEditId(null);
    setEditValue("");
    fetchCategories();
  };

  return (
    <div className="container">
      <h2>ניהול קטגוריות</h2>
      <button className="btn btn-primary" onClick={onBack}>חזור</button>

      <div style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="הוסף קטגוריה חדשה"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button className="btn btn-login" onClick={handleAdd}>הוסף</button>
      </div>

      <ul style={{ marginTop: 20 }}>
        {categories.map(cat => (
          <li key={cat.id}>
            {editId === cat.id ? (
              <>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <button className="btn btn-login" onClick={saveEdit}>שמור</button>
              </>
            ) : (
              <>
                <span><strong>{cat.name}</strong></span>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-login" onClick={() => startEdit(cat)}>ערוך</button>
                  <button className="btn btn-primary" style={{ backgroundColor: '#dc3545' }} onClick={() => handleDelete(cat.id)}>מחק</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}