const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// חיבור ל-MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('📡 מחובר ל־MongoDB'))
  .catch(err => console.error('שגיאה בחיבור ל־MongoDB', err));

// סכמות
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const taskSchema = new mongoose.Schema({
  username: String,
  title: String
});
const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);

// אימות JWT
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

// הרשמה
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();
  res.json({ message: 'נרשמת בהצלחה' });
});

// התחברות
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'משתמש לא נמצא' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'סיסמה לא נכונה' });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// הצגת משימות
app.get('/tasks', authenticateToken, async (req, res) => {
  const tasks = await Task.find({ username: req.user.username });
  res.json(tasks);
});

// הוספת משימה
app.post('/tasks', authenticateToken, async (req, res) => {
  const { title } = req.body;
  const task = new Task({ username: req.user.username, title });
  await task.save();
  res.json({ message: 'נשמר', task });
});

// עדכון משימה
app.put('/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'לא נמצא' });
    if (task.username !== req.user.username)
      return res.status(403).json({ error: 'אין הרשאה' });

    task.title = title;
    await task.save();
    res.json({ message: 'עודכן', task });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בעדכון' });
  }
});

// מחיקת משימה
app.delete('/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id);
  if (!task) return res.status(404).json({ error: 'לא נמצא' });
  if (task.username !== req.user.username)
    return res.status(403).json({ error: 'אין הרשאה' });

  await task.deleteOne();
  res.json({ message: 'נמחק' });
});

module.exports = app;
