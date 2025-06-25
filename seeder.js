require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// מודל המשתמש
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', userSchema);

// התחברות למסד הנתונים
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('📡 מחובר ל־MongoDB');

    // ניקוי משתמשים קיימים עם אותו שם
    await User.deleteMany({ username: 'demo' });

    // יצירת משתמש חדש
    const hashed = await bcrypt.hash('demo123', 10);
    const user = new User({ username: 'demo', password: hashed });
    await user.save();

    console.log('✅ משתמש ניסיון נוצר: demo / demo123');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ שגיאה בחיבור ל־MongoDB:', err);
  });
