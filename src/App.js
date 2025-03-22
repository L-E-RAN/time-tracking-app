import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import emailjs from "emailjs-com";

export default function App() {
  const [taskName, setTaskName] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);


  


  useEffect(() => {
    const storedLogs = localStorage.getItem("taskLogs");
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }

    const savedTask = localStorage.getItem("currentTask");
    const savedStart = localStorage.getItem("startTime");
    if (savedTask && savedStart) {
      const start = new Date(savedStart);
      setTaskName(savedTask);
      setStartTime(start);
      setTimerActive(true);
      setElapsed(Math.floor((Date.now() - start.getTime()) / 1000));
    }
  }, []);

  useEffect(() => {
    let interval;
    if (timerActive && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, startTime]);

  useEffect(() => {
    localStorage.setItem("taskLogs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    if (taskName && startTime) {
      localStorage.setItem("currentTask", taskName);
      localStorage.setItem("startTime", startTime.toISOString());
    } else {
      localStorage.removeItem("currentTask");
      localStorage.removeItem("startTime");
    }
  }, [taskName, startTime]);

<<<<<<< HEAD
=======

>>>>>>> 2572d3843c150f26ec4b4d66c4428684a76f51fd
  const formatElapsed = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const startTask = () => {
    const name = prompt("Enter task name:");
    if (name) {
      const now = new Date();
      setTaskName(name);
      setStartTime(now);
      setTimerActive(true);
      setElapsed(0);
    }
  };

  const endTask = () => {
    if (!taskName || !startTime) return alert("No task in progress");

    const endTime = new Date();
    const durationMs = endTime - startTime;
    const durationMin = Math.floor(durationMs / 60000);
    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;

    const log = {
      date: startTime.toLocaleDateString(),
      from: startTime.toLocaleTimeString(),
      to: endTime.toLocaleTimeString(),
      duration: `${hours}h ${minutes}m`,
      task: taskName,
      durationMinutes: durationMin,
    };

    setLogs([...logs, log]);
    setTaskName("");
    setStartTime(null);
    setTimerActive(false);
    setElapsed(0);
  };

  const endDay = () => {
    const today = new Date().toLocaleDateString();
    const todayLogs = logs.filter(log => log.date === today);
    const totalMinutes = todayLogs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    setSummary({
      date: today,
      tasks: todayLogs.length,
      time: `${totalHours}h ${remainingMinutes}m`
    });
  };

  const downloadExcel = () => {
    const exportLogs = logs.map(({ durationMinutes, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(exportLogs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Task Logs");
    XLSX.writeFile(workbook, "task_logs.xlsx");
  };

  const sendEmail = () => {
    const today = new Date().toLocaleDateString();
    const todayLogs = logs.filter(log => log.date === today);
    const content = todayLogs.map(log => 
      `${log.task}: ${log.from} - ${log.to} (${log.duration})`).join("\n");

    const templateParams = {
      subject: `Task Report for ${today}`,
      message: content || "No tasks logged today."
    };

    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", templateParams, "YOUR_USER_ID")
      .then(() => alert("Email sent!"))
      .catch(err => alert("Email failed: " + err.text));
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: 'auto' }}>
      <h1>Time Tracking</h1>
      <div style={{ marginBottom: 10 }}>
        <button onClick={startTask}>Start Task Logging</button>
        <button onClick={endTask}>End Task Logging</button>
        <button onClick={endDay}>End Day</button>
      </div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={downloadExcel}>Download Excel Report</button>
        <button onClick={sendEmail}>Send by Email</button>
      </div>
      {taskName && timerActive && (
        <div>
          <strong>Task in progress:</strong> {taskName}<br />
          <strong>Elapsed Time:</strong> {formatElapsed(elapsed)}
        </div>
      )}
      {summary && (
        <div>
          <h3>Daily Summary ({summary.date})</h3>
          <p>Total Tasks: {summary.tasks}</p>
          <p>Total Time: {summary.time}</p>
        </div>
      )}
      <ul>
        {logs.map((log, i) => (
          <li key={i}>
            <strong>{log.task}</strong> | {log.date} | {log.from} - {log.to} | {log.duration}
          </li>
        ))}
      </ul>
    </div>
  );
}
