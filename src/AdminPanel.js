console.log("AdminPanel נטען");
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

export default function AdminPanel({ user, onBack }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  // טעינת קטגוריות מהמסד
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, "categories"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(data);
      } catch (error) {
        console.error("שגיאה בטעינת קטגוריות:", error);
      }
    };

    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const docRef = await addDoc(collection(db, "categories"), {
        name: newCategory.trim()
      });
      setCategories([...categories, { id: docRef.id, name: newCategory.trim() }]);
      setNewCategory("");
    } catch (error) {
      console.error("שגיאה בהוספת קטגוריה:", error);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("האם למחוק את הקטגוריה?")) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      console.error("שגיאה במחיקת קטגוריה:", error);
    }
  };

  return (
    <div className="container">
      <h2>ניהול קטגוריות</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: 20 }}>
        <input
          type="text"
          placeholder="שם קטגוריה חדשה"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button className="btn btn-login" onClick={addCategory}>הוסף</button>
      </div>

      <ul>
        {categories.map((cat) => (
          <li key={cat.id}>
            {cat.name}
            <button onClick={() => deleteCategory(cat.id)} style={{ marginRight: 10 }}>
              🗑️
            </button>
          </li>
        ))}
      </ul>

      <button onClick={onBack} className="btn btn-primary" style={{ marginTop: 30 }}>
        חזור
      </button>
    </div>
  );
}
