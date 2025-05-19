import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import { register, login, getMe, logout, updateProfile, validate } from '../controllers/auth.controller.js';

const router = express.Router();

// נתיב להרשמה
router.post('/register', register);

// נתיב להתחברות
router.post('/login', login);

// נתיב לאימות טוקן
router.get('/validate', auth, (req, res) => {
  res.json({ valid: true });
});

// נתיב לקבלת פרטי משתמש
router.get('/me', auth, getMe);

// נתיב להתנתקות
router.post('/logout', auth, logout);

// עדכון פרופיל
router.put('/profile', auth, updateProfile);

export default router;