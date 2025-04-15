import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export const auth = async (req, res, next) => {
  try {
    // בדיקה האם קיים טוקן בכותרת הבקשה
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    // אימות הטוקן
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // הוספת המידע המפוענח לאובייקט הבקשה
    req.userId = decoded.id;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'אנא התחבר למערכת' });
  }
};

export default auth; 