// AuthForm.js - יצירת מסמך משתמש חדש עם email ו-isAdmin
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function AuthForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      const userCredential = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;

      // יצירת מסמך משתמש אם לא קיים
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          isAdmin: false,
        });
      }

      onLogin(user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h2>{isLogin ? "התחברות" : "הרשמה"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <button type="submit" className="btn btn-login" style={{ maxWidth: 300 }}>
            {isLogin ? "כניסה" : "צור משתמש"}
          </button>
          <button onClick={() => setIsLogin(!isLogin)} className="btn btn-register" style={{ maxWidth: 300 }}>
            {isLogin ? "עדיין אין לך משתמש? לחץ כאן" : "כבר רשום? התחבר"}
          </button>
        </div>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </>
  );
}
