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
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

export default function TaskTracker({ user }) {
  const [taskName, setTaskName] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [logs, setLogs] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [totalMinutesToday, setTotalMinutesToday] = useState(0);
  const [totalMinutesAll, setTotalMinutesAll] = useState(0);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [showStartForm, setShowStartForm] = useState(false);
  const [editLogId, setEditLogId] = useState(null);
  const [editCategory, setEditCategory] = useState("");
  const [editTaskName, setEditTaskName] = useState("");
  const [showAll, setShowAll] = useState(false);

  const formatTimeHebrew = (minutes) => {
    if (isNaN(minutes)) return "0 שעות ו־0 דקות";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h} ${h === 1 ? "שעה" : "שעות"} ו־${m} ${m === 1 ? "דקה" : "דקות"}`;
  };

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
    if (!user) return;
    const fetchLogs = async () => {
      try {
        const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const loadedLogs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const sortedLogs = loadedLogs.sort((a, b) => {
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          return a.from.localeCompare(b.from);
        });

        setLogs(sortedLogs);

        const todayStr = formatDate(new Date());
        let totalToday = 0;
        let totalAll = 0;

        sortedLogs.forEach(log => {
          const [hStr, mStr] = (log.duration || "0 0").split(" ");
          const h = parseInt(hStr) || 0;
          const m = parseInt(mStr) || 0;
          const duration = h * 60 + m;
          totalAll += duration;
          if (log.date === todayStr) totalToday += duration;
        });

        setTotalMinutesToday(totalToday);
        setTotalMinutesAll(totalAll);
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
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
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
      const [hStr, mStr] = (log.duration || "0 0").split(" ");
      const h = parseInt(hStr) || 0;
      const m = parseInt(mStr) || 0;
      acc[log.category].value += h * 60 + m;
      return acc;
    }, {})
  );

  return (
    <>
      <h2>המשימות שלך</h2>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: "1.6em", fontWeight: "bold" }}>
          סה״כ היום: {formatTimeHebrew(totalMinutesToday)}
        </div>
        <div style={{ fontSize: "1em", marginTop: 5 }}>
          סה״כ כללי: {formatTimeHebrew(totalMinutesAll)}
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button className="btn btn-login" onClick={() => setShowAll(!showAll)}>
          {showAll ? "הצג רק את היום" : "הצג את כל המשימות"}
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={startTask}>התחל משימה</button>
        <button className="btn btn-primary" onClick={endTask} disabled={!timerActive}>סיום משימה</button>
        <button className="btn btn-primary" onClick={downloadExcel}>יצוא לאקסל</button>
      </div>

      {showStartForm && (
        <div className="task-start-box">
          <h3>פרטי התחלת משימה</h3>
          <div className="task-form">
            <label>שם משימה</label>
            <input
              type="text"
              placeholder="לדוגמה: סידור קבצים"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />

            <label>קטגוריה</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">בחר קטגוריה</option>
              {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>

            <button className="btn btn-login" onClick={confirmStartTask}>
              🚀 התחל
            </button>
          </div>
        </div>
      )}

      {timerActive && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <p><strong>{taskName}</strong> | {category} | {formatElapsed(elapsed)}</p>
          <progress value={elapsed % 3600} max={3600} />
        </div>
      )}

      <ul style={{ marginTop: 30 }}>
        {logs
          .filter(log => showAll || log.date === formatDate(new Date()))
          .map(log => (
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
