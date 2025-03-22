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
} from "firebase/firestore";
import * as XLSX from "xlsx";

export default function TaskTracker({ user }) {
  const [taskName, setTaskName] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [logs, setLogs] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    const savedStart = localStorage.getItem("task_start");
    const savedName = localStorage.getItem("task_name");
    if (savedStart && savedName) {
      const parsedStart = new Date(savedStart);
      setStartTime(parsedStart);
      setTaskName(savedName);
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
      const q = query(
        collection(db, "tasks"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(data);

      const today = formatDate(new Date());
      const todayLogs = data.filter(log => log.date === today);
      const minutes = todayLogs.reduce((sum, log) => {
        const [h, m] = log.duration
          .replace("h", "")
          .replace("m", "")
          .split(" ")
          .map(Number);
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

  const formatTime = (dateObj) => {
    return dateObj.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  };

  const formatElapsed = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const startTask = () => {
    if (timerActive) {
      alert("יש כבר משימה פעילה! סיים אותה לפני שתתחיל חדשה.");
      return;
    }
    const name = prompt("הכנס שם משימה:");
    if (name) {
      const now = new Date();
      setTaskName(name);
      setStartTime(now);
      setElapsed(0);
      setTimerActive(true);
      localStorage.setItem("task_start", now.toISOString());
      localStorage.setItem("task_name", name);
    }
  };

  const cancelTask = () => {
    if (!timerActive) return;
    const confirmCancel = window.confirm("לבטל את המשימה הפעילה?");
    if (confirmCancel) {
      setTaskName("");
      setStartTime(null);
      setElapsed(0);
      setTimerActive(false);
      localStorage.removeItem("task_start");
      localStorage.removeItem("task_name");
    }
  };

  const endTask = async () => {
    if (!taskName || !startTime) return alert("אין משימה פעילה כעת");

    const endTime = new Date();
    const durationMs = endTime - startTime;
    const durationMin = Math.floor(durationMs / 60000);
    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;

    const log = {
      userId: user.uid,
      task: taskName,
      date: formatDate(startTime),
      from: formatTime(startTime),
      to: formatTime(endTime),
      duration: `${hours}h ${minutes}m`,
    };

    const docRef = await addDoc(collection(db, "tasks"), log);
    setLogs([...logs, { id: docRef.id, ...log }]);
    setTaskName("");
    setStartTime(null);
    setElapsed(0);
    setTimerActive(false);
    localStorage.removeItem("task_start");
    localStorage.removeItem("task_name");
  };

  const deleteTask = async (id) => {
    await deleteDoc(doc(db, "tasks", id));
    setLogs(logs.filter((log) => log.id !== id));
  };

  const downloadExcel = () => {
    const exportLogs = logs.map(({ id, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(exportLogs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
    XLSX.writeFile(workbook, `tasks_${user.email}.xlsx`);
  };

  const totalHours = Math.floor(totalMinutes / 60);
  const totalRemainder = totalMinutes % 60;

  return (
    <div style={{ marginTop: 20 }}>
      <h2>המשימות שלך ל־{formatDate(new Date())}</h2>
      <p>סה״כ זמן עבודה: {totalHours}h {totalRemainder}m</p>
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
        <button className="btn btn-primary" onClick={startTask}>התחל משימה</button>
        <button className="btn btn-primary" onClick={endTask} disabled={!timerActive}>סיום משימה</button>
        <button className="btn btn-primary" onClick={cancelTask} disabled={!timerActive}>בטל משימה</button>
        <button className="btn btn-primary" onClick={downloadExcel}>יצוא לקובץ אקסל</button>
      </div>
      {timerActive && (
        <p>
          <strong>משימה:</strong> {taskName} | <strong>זמן:</strong> {formatElapsed(elapsed)}
        </p>
      )}
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            <span>🕒 <strong>{log.task}</strong> | {log.date} | {log.from} - {log.to} | {log.duration}</span>
            <button onClick={() => deleteTask(log.id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
