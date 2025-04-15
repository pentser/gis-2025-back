import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import User from '../models/user.model.js';

export const auth = async (req, res, next) => {
  try {
    // בדיקת הטוקן בכותרת הבקשה
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'אין הרשאה - טוקן חסר' });
    }

    // אימות הטוקן
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // מציאת המשתמש במסד הנתונים
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'משתמש לא נמצא' });
    }

    // בדיקה אם המשתמש פעיל
    if (!user.isActive) {
      return res.status(403).json({ message: 'המשתמש אינו פעיל' });
    }

    // הוספת פרטי המשתמש לאובייקט הבקשה
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'אין הרשאה - טוקן לא תקין' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'אין הרשאה - טוקן פג תוקף' });
    }
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
};

export const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'אין הרשאת מנהל' });
    }
    next();
  } catch (error) {
    console.error('שגיאה בבדיקת הרשאות מנהל:', error);
    res.status(500).json({ message: 'שגיאת שרת פנימית' });
  }
}; 