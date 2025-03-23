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
  updateDoc,
  orderBy
} from "firebase/firestore";
import * as XLSX from "xlsx";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
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
    if (!user) return;
    const fetchLogs = async () => {
      try {
        const q = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid),
          orderBy("date", "desc")
        );
        const snapshot = await getDocs(q);
        const loadedLogs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLogs(loadedLogs);
        const total = loadedLogs.reduce((sum, log) => {
          const [h, m] = log.duration.split(" ").map(Number);
          return sum + (h * 60 + m);
        }, 0);
        setTotalMinutes(total);
      } catch (error) {
        console.error("שגיאה בטעינת משימות:", error);
      }
    };
    fetchLogs();
  }, [user]);

  useEffect(() => {
    const savedStart = localStorage.getItem("task_start");
    const savedName = localStorage.getItem("task_name");
    const savedCat = localStorage.getItem("task_category");
    if (savedStart && savedName) {
      const parsedStart = new Date(savedStart);
      if (!isNaN(parsedStart)) {
        setStartTime(parsedStart);
        setTaskName(savedName);
        setCategory(savedCat || "");
        setTimerActive(true);
      }
    }
  }, []);

  useEffect(() => {
    if (timerActive && startTime) {
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive, startTime]);

  const formatDate = (dateObj) => {
    const d = new Date(dateObj);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (dateObj) =>
    new Date(dateObj).toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

  const formatElapsed = (seconds) =>
    `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m ${seconds % 60}s`;

  const startTask = () => {
    if (timerActive) return alert("יש כבר משימה פעילה!");
    setTaskName("");
    setCategory(categories[0] || "");
    setShowStartForm(true);
  };

  const confirmStartTask = () => {
    if (!taskName.trim()) return alert("אנא הזן שם משימה.");
    if (!category.trim()) return alert("אנא בחר קטגוריה.");
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
    const validStartTime = new Date(startTime);
    if (!taskName || !(validStartTime instanceof Date) || isNaN(validStartTime)) {
      alert("אין משימה פעילה");
      return;
    }

    const endTime = new Date();
    const durationMin = Math.floor((endTime - validStartTime) / 60000);
    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;

    const log = {
      userId: user.uid,
      task: taskName,
      date: formatDate(validStartTime),
      from: formatTime(validStartTime),
      to: formatTime(endTime),
      duration: `${hours} ${minutes}`,
      category: category || "לא מוגדר"
    };

    try {
      const docRef = await addDoc(collection(db, "tasks"), log);
      setLogs(prev => [{ id: docRef.id, ...log }, ...prev]);
      setTaskName("");
      setStartTime(null);
      setElapsed(0);
      setCategory(categories[0] || "");
      setTimerActive(false);
      localStorage.clear();
      setTotalMinutes(prev => prev + durationMin);
    } catch (error) {
      console.error("שגיאה בעת שמירת המשימה:", error);
      alert("אירעה שגיאה בעת שמירת המשימה. נסה שוב.");
    }
  };

  const deleteLog = async (id) => {
    if (!window.confirm("האם למחוק את המשימה?")) return;
    await deleteDoc(doc(db, "tasks", id));
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const startEdit = (log) => {
    setEditLogId(log.id);
    setEditTaskName(log.task);
    setEditCategory(log.category);
  };

  const saveEdit = async () => {
    await updateDoc(doc(db, "tasks", editLogId), {
      task: editTaskName,
      category: editCategory
    });
    setLogs(prev => prev.map(l => l.id === editLogId
      ? { ...l, task: editTaskName, category: editCategory }
      : l
    ));
    setEditLogId(null);
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(logs);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tasks");
    XLSX.writeFile(wb, "tasks.xlsx");
  };

  const pieData = Object.values(
    logs.reduce((acc, log) => {
      acc[log.category] = acc[log.category] || { name: log.category, value: 0 };
      const [h, m] = log.duration.split(" ").map(Number);
      acc[log.category].value += h * 60 + m;
      return acc;
    }, {})
  );

  return (
    <>
      <h2>המשימות שלך</h2>
      <p>
        סה״כ זמן עבודה:{" "}
        {isNaN(totalMinutes)
          ? "0h 0m"
          : `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={startTask}>התחל משימה</button>
        <button className="btn btn-primary" onClick={endTask} disabled={!timerActive}>סיום משימה</button>
        <button className="btn btn-primary" onClick={downloadExcel}>יצוא לאקסל</button>
      </div>

      {showStartForm && (
        <div style={{ marginTop: 20, background: "#f0f2f5", padding: 20, borderRadius: 12 }}>
          <h4>פרטי התחלת משימה</h4>
          <input
            type="text"
            placeholder="שם משימה"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">בחר קטגוריה</option>
            {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
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

      <ul style={{ marginTop: 30 }}>
        {logs.map(log => (
          <li key={log.id}>
            {editLogId === log.id ? (
              <>
                <input value={editTaskName} onChange={e => setEditTaskName(e.target.value)} />
                <select value={editCategory} onChange={e => setEditCategory(e.target.value)}>
                  {categories.map((c, i) => <option key={i}>{c}</option>)}
                </select>
                <button className="btn btn-login" onClick={saveEdit}>שמור</button>
              </>
            ) : (
              <>
                <span>
                  {log.date} | {log.task} | {log.category} | {log.from}-{log.to} | {log.duration}
                </span>
                <div>
                  <button onClick={() => startEdit(log)}>✏️</button>
                  <button onClick={() => deleteLog(log.id)}>🗑️</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {pieData.length > 0 && (
        <div style={{ height: 300, marginTop: 30 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}
