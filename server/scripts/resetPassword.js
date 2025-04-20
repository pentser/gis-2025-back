/**
 * סקריפט לאיפוס סיסמה של משתמש לפי אימייל
 * 
 * אופן הרצה:
 * node scripts/resetPassword.js email@example.com newPassword123
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';

// טעינת משתני סביבה
dotenv.config();

// בדיקת הפרמטרים
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('שגיאה: יש לספק אימייל וסיסמה חדשה');
  console.log('שימוש: node scripts/resetPassword.js email@example.com newPassword123');
  process.exit(1);
}

// פונקציה לאיפוס סיסמה
async function resetPassword(email, newPassword) {
  try {
    console.log(`מנסה לאפס סיסמה למשתמש ${email}...`);
    
    // התחברות למסד הנתונים
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('התחברות למסד הנתונים הצליחה!');
    
    // חיפוש המשתמש
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`שגיאה: לא נמצא משתמש עם האימייל ${email}`);
      return false;
    }
    
    // הצפנת הסיסמה החדשה
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // עדכון הסיסמה
    user.password = hashedPassword;
    await user.save();
    
    console.log(`סיסמה אופסה בהצלחה למשתמש ${email}`);
    return true;
  } catch (error) {
    console.error('שגיאה באיפוס הסיסמה:', error);
    return false;
  } finally {
    // סגירת החיבור למסד הנתונים
    await mongoose.disconnect();
    console.log('החיבור למסד הנתונים נסגר');
  }
}

// הרצת הפונקציה הראשית
resetPassword(email, newPassword)
  .then(success => {
    console.log(success ? 'הסקריפט הסתיים בהצלחה' : 'הסקריפט נכשל');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('שגיאה בהרצת הסקריפט:', err);
    process.exit(1);
  }); 