// שינויים ב־TaskTracker.js (רק החלקים הרלוונטיים מוצגים)

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

// צבעים לגרף
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

export default function TaskTracker({ user }) {
  const [taskName, setTaskName] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [logs, setLogs] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [category, setCategory] = useState("");

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

  useEffect(() => {
    const fetchLogs = async () => {
      const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(data);

      const today = formatDate(new Date());
      const todayLogs = data.filter(log => log.date === today);
      const minutes = todayLogs.reduce((sum, log) => {
        const [h, m] = log.duration.replace("h", "").replace("m", "").split(" ").map(Number);
        return sum + h * 60 + m;
      }, 0);
      setTotalMinutes(minutes);
    };
    fetchLogs();
  }, [user]);

  const formatDate = (dateObj) => {
    const d = new Date(dateObj);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (dateObj) => dateObj.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", hour12: false });
  const formatElapsed = (seconds) => `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m ${seconds % 60}s`;

  const startTask = () => {
    if (timerActive) return alert("יש כבר משימה פעילה!");
    const name = prompt("הכנס שם משימה:");
    const cat = prompt("הכנס קטגוריה (למשל: פיתוח/תמיכה):");
    if (name) {
      const now = new Date();
      setTaskName(name);
      setCategory(cat || "כללי");
      setStartTime(now);
      setElapsed(0);
      setTimerActive(true);
      localStorage.setItem("task_start", now.toISOString());
      localStorage.setItem("task_name", name);
      localStorage.setItem("task_category", cat || "");
    }
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
      category: category || "כללי"
    };

    const docRef = await addDoc(collection(db, "tasks"), log);
    setLogs([...logs, { id: docRef.id, ...log }]);
    setTaskName("");
    setStartTime(null);
    setElapsed(0);
    setCategory("");
    setTimerActive(false);
    localStorage.clear();
  };

  const deleteTask = async (id) => {
    await deleteDoc(doc(db, "tasks", id));
    setLogs(logs.filter((log) => log.id !== id));
  };

  const editTask = async (log) => {
    const newName = prompt("שם חדש למשימה:", log.task);
    const newCat = prompt("קטגוריה חדשה:", log.category);
    if (newName) {
      const ref = doc(db, "tasks", log.id);
      await updateDoc(ref, { task: newName, category: newCat });
      setLogs(logs.map(l => l.id === log.id ? { ...l, task: newName, category: newCat } : l));
    }
  };

  const totalHours = Math.floor(totalMinutes / 60);
  const totalRemainder = totalMinutes % 60;

  // גרפים לפי קטגוריה וזמן יומי
  const categoryStats = logs.reduce((acc, log) => {
    const cat = log.category || "כללי";
    const [h, m] = log.duration.replace("h", "").replace("m", "").split(" ").map(Number);
    acc[cat] = (acc[cat] || 0) + h * 60 + m;
    return acc;
  }, {});
  const categoryData = Object.entries(categoryStats).map(([name, value]) => ({ name, value }));

  const dailyStats = logs.reduce((acc, log) => {
    acc[log.date] = acc[log.date] || 0;
    const [h, m] = log.duration.replace("h", "").replace("m", "").split(" ").map(Number);
    acc[log.date] += h * 60 + m;
    return acc;
  }, {});
  const dailyData = Object.entries(dailyStats).map(([date, minutes]) => ({ date, minutes }));

  return (
    <div style={{ marginTop: 20 }}>
      <h2>המשימות שלך ל־{formatDate(new Date())}</h2>
      <p>סה״כ זמן עבודה: {totalHours}h {totalRemainder}m</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button className="btn btn-primary" onClick={startTask}>התחל משימה</button>
        <button className="btn btn-primary" onClick={endTask} disabled={!timerActive}>סיום משימה</button>
      </div>

      {timerActive && (
        <div>
          <p><strong>{taskName}</strong> | {category} | {formatElapsed(elapsed)}</p>
          <progress value={elapsed % 3600} max={3600} style={{ width: "100%", height: 20 }} />
        </div>
      )}

      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            <span>🕒 <strong>{log.task}</strong> ({log.category}) | {log.date} | {log.from} - {log.to} | {log.duration}</span>
            <button onClick={() => editTask(log)}>✏️</button>
            <button onClick={() => deleteTask(log.id)}>🗑️</button>
          </li>
        ))}
      </ul>

      <h3>סטטיסטיקות לפי קטגוריה</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={80}>
            {categoryData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <h3>זמן עבודה יומי</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={dailyData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="minutes" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}