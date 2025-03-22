import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";

export default function TaskTracker({ user }) {
  const [taskName, setTaskName] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [logs, setLogs] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

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
      const data = querySnapshot.docs.map(doc => doc.data());
      setLogs(data);
    };
    fetchLogs();
  }, [user]);

  const formatElapsed = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const startTask = () => {
    const name = prompt("Enter task name:");
    if (name) {
      setTaskName(name);
      setStartTime(new Date());
      setElapsed(0);
      setTimerActive(true);
    }
  };

  console.log("END TASK CLICKED");
  const endTask = async () => {
    if (!taskName || !startTime) return alert("No task in progress");

    const endTime = new Date();
    const durationMs = endTime - startTime;
    const durationMin = Math.floor(durationMs / 60000);
    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;

    const log = {
      userId: user.uid,
      task: taskName,
      date: startTime.toLocaleDateString(),
      from: startTime.toLocaleTimeString(),
      to: endTime.toLocaleTimeString(),
      duration: `${hours}h ${minutes}m`,
    };

    await addDoc(collection(db, "tasks"), log);
    setLogs([...logs, log]);
    setTaskName("");
    setStartTime(null);
    setElapsed(0);
    setTimerActive(false);
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(logs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
    XLSX.writeFile(workbook, `tasks_${user.email}.xlsx`);
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h2>משימות שלך</h2>
      <button onClick={startTask}>Start Task</button>
      <button onClick={endTask} disabled={!timerActive}>End Task</button>
      <button onClick={downloadExcel}>Download Excel</button>
      {timerActive && (
        <p>
          <strong>Task:</strong> {taskName} | <strong>Elapsed:</strong> {formatElapsed(elapsed)}
        </p>
      )}
      <ul>
        {logs.map((log, index) => (
          <li key={index}>
            <strong>{log.task}</strong> | {log.date} | {log.from} - {log.to} | {log.duration}
          </li>
        ))}
      </ul>
    </div>
  );
}
