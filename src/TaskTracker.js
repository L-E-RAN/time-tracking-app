// TaskTracker.js - תיקונים: טעינת קטגוריות עם טיפול בשגיאות, ולידציה חזקה, עטיפה כללית

import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import * as XLSX from "xlsx";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

export default function TaskTracker({ user }) {
  const [taskName, setTaskName] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [logs, setLogs] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [showStartForm, setShowStartForm] = useState(false);
  const [editLogId, setEditLogId] = useState(null);
  const [editCategory, setEditCategory] = useState("");
  const [editTaskName, setEditTaskName] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, "categories"));
        const data = snapshot.docs.map(doc => doc.data().name);
        setCategories(data);
        if (data.length > 0) setCategory(data[0]);
      } catch (error) {
        console.error("שגיאה בטעינת קטגוריות:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const savedStart = localStorage.getItem("task_start");
    const savedName = localStorage.getItem("task_name");
    const savedCat = localStorage.getItem("task_category");
    if (savedStart && savedName) {
      const parsedStart = new Date(savedStart);
      setStartTime(parsedStart);
      setTaskName(savedName);
      setCategory(savedCat || "");
      setTimerActive(true);
    }
  }, []);

  useEffect(() => {
    if (timerActive && startTime) {
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive, startTime]);

  const startTask = () => {
    if (timerActive) return alert("יש כבר משימה פעילה!");
    setTaskName("");
    setCategory(categories[0] || "");
    setShowStartForm(true);
  };

  const confirmStartTask = () => {
    if (!taskName.trim()) {
      alert("אנא הזן שם משימה.");
      return;
    }
    if (!category.trim()) {
      alert("אנא בחר קטגוריה.");
      return;
    }
    const now = new Date();
    setStartTime(now);
    setElapsed(0);
    setTimerActive(true);
    localStorage.setItem("task_start", now.toISOString());
    localStorage.setItem("task_name", taskName);
    localStorage.setItem("task_category", category);
    setShowStartForm(false);
  };

  const endTask = async () => {
    if (!taskName || !startTime) return alert("אין משימה פעילה");
    const endTime = new Date();
    const durationMin = Math.floor((endTime - startTime) / 60000);
    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;

    const log = {
      userId: user.uid,
      task: taskName,
      date: formatDate(startTime),
      from: formatTime(startTime),
      to: formatTime(endTime),
      duration: `${hours}h ${minutes}m`,
      category: category || "לא מוגדר"
    };

    const docRef = await addDoc(collection(db, "tasks"), log);
    setLogs(prev => [{ id: docRef.id, ...log }, ...prev]);
    setTaskName("");
    setStartTime(null);
    setElapsed(0);
    setCategory(categories[0] || "");
    setTimerActive(false);
    localStorage.clear();
  };

  const formatDate = (dateObj) => {
    const d = new Date(dateObj);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (dateObj) => dateObj.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", hour12: false });
  const formatElapsed = (seconds) => `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m ${seconds % 60}s`;

  return (
    <div className="container">
      <h2>המשימות שלך ל־{formatDate(new Date())}</h2>
      <p>סה״כ זמן עבודה: {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</p>

      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <button className="btn btn-primary" onClick={startTask}>התחל משימה</button>
        <button className="btn btn-primary" onClick={endTask} disabled={!timerActive}>סיום משימה</button>
        <button className="btn btn-primary" onClick={() => downloadExcel()}>יצוא לאקסל</button>
      </div>

      {showStartForm && (
        <div style={{ maxWidth: 400, margin: "0 auto", background: "#f0f2f5", padding: 20, borderRadius: 12 }}>
          <h4>פרטי התחלת משימה</h4>
          <input
            type="text"
            placeholder="שם משימה"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          >
            <option value="">בחר קטגוריה</option>
            {categories.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
          <button className="btn btn-login" onClick={confirmStartTask}>התחל</button>
        </div>
      )}

      {timerActive && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <p><strong>{taskName}</strong> | {category} | {formatElapsed(elapsed)}</p>
          <progress value={elapsed % 3600} max={3600} style={{ width: "100%", height: 20 }} />
        </div>
      )}

      {/* המשך: הצגת משימות, גרפים וכו' */}
    </div>
  );
}