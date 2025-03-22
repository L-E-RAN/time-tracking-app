# אפליקציית דיווח שעות - Time Tracking App

אפליקציית React קלה ונוחה לדיווח משימות, מעקב זמן, ייצוא לאקסל ושליחת דוחות במייל.

---

## 🚀 הרצה מקומית

1. התקן את התלויות:
```
npm install
```

2. הפעל את האפליקציה:
```
npm start
```

---

## 🌍 פריסה אונליין (Vercel)

### שלבים:
1. דחוף את הקוד ל-GitHub:
```
git add .
git commit -m "עדכון"
git push
```

2. כנס ל-[Vercel](https://vercel.com) ובחר את הריפו שלך
3. לחץ Deploy

**Vercel יזהה שזו אפליקציית React ויבצע פריסה אוטומטית.**

---

## 🧠 פיצ'רים קיימים

- ✅ התחלת וסיום משימות עם טיימר
- ✅ תיעוד משימות כולל תאריך, שעת התחלה, שעת סיום וזמן כולל
- ✅ טיימר חי (Elapsed Time)
- ✅ שמירה אוטומטית ב-LocalStorage
- ✅ סיכום יומי: מספר משימות + זמן כולל
- ✅ ייצוא לאקסל
- ✅ שליחת דוח במייל (EmailJS)

---

## 📧 הגדרות לשליחת מייל (EmailJS)

1. הירשם ל-[EmailJS](https://www.emailjs.com)
2. צור:
   - שירות (Service)
   - תבנית (Template) עם משתנים: `subject`, `message`
3. קבל:
   - Service ID
   - Template ID
   - Public Key

4. הכנס אותם לקובץ `App.js`:

```js
emailjs.send(
  "SERVICE_ID",
  "TEMPLATE_ID",
  { subject: ..., message: ... },
  "USER_ID"
);
```

---
