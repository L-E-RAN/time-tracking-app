// TaskTracker.js - עדכון התחלת משימה לכלול גם שם וגם קטגוריה באותו חלון

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
      const snapshot = await getDocs(collection(db, "categories"));
      const data = snapshot.docs.map(doc => doc.data().name);
      setCategories(data);
      if (data.length > 0) setCategory(data[0]);
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
    if (!taskName.trim() || !category.trim()) {
      alert("יש להזין שם משימה ולבחור קטגוריה.");
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

  // ... הקוד הנוסף נשאר זהה ...

  return (
    <div style={{ marginTop: 20 }}>
      <h2>המשימות שלך ל־{formatDate(new Date())}</h2>
      <p>סה״כ זמן עבודה: {totalHours}h {totalRemainder}m</p>

      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <button className="btn btn-primary" onClick={startTask}>התחל משימה</button>
        <button className="btn btn-primary" onClick={endTask} disabled={!timerActive}>סיום משימה</button>
        <button className="btn btn-primary" onClick={downloadExcel}>יצוא לאקסל</button>
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
            {categories.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
          <button className="btn btn-login" onClick={confirmStartTask}>התחל</button>
        </div>
      )}

      {/* שאר הרינדור כמו רשימת משימות, טיימר, גרפים וכו' */}
    </div>
  );
}
