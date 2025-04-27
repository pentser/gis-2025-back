import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import User from '../models/user.model.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'אנא התחבר למערכת' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'משתמש לא נמצא' });
    }

    req.user = user;
    req.userId = decoded.id;
    
    next();
  } catch (error) {
    console.error('שגיאת אותנטיקציה:', error);
    res.status(401).json({ message: 'אנא התחבר למערכת' });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'אנא התחבר למערכת' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'אין לך הרשאות מנהל' });
    }

    next();
  } catch (error) {
    console.error('שגיאת הרשאות:', error);
    res.status(403).json({ message: 'אין הרשאה לבצע פעולה זו' });
  }
};

export default auth; 