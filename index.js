// index.js (הקובץ המרכזי של השרת)

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const users = []; // משתמשים בזיכרון
const tasks = []; // משימות

// פונקציית אימות טוקן JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// דף ראשי
app.get('/', (req, res) => {
  res.send('הגעת ל-Task Manager!');
});



// הרשמה
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });
  res.json({ redirect: '/welcome' });
});

// התחברות
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'משתמש לא נמצא' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'סיסמה לא נכונה' });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// הוספת משימה (למשתמש מחובר בלבד)
app.post('/tasks', authenticateToken, (req, res) => {
  const { title } = req.body;
  const task = { username: req.user.username, title };
  tasks.push(task);
  res.json({ message: 'Task added', task });
});

// שליפת משימות (למשתמש מחובר בלבד)
app.get('/tasks', authenticateToken, (req, res) => {
  const userTasks = tasks.filter(task => task.username === req.user.username);
  res.json(userTasks);
});

// הפעלת השרת
app.listen(5000, () => {
  console.log('🔥 שרת רץ על פורט 5000');
});
