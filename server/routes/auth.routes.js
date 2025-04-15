import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import { register, login, getMe, logout } from '../controllers/auth.controller.js';

const router = express.Router();

// נתיב להרשמה
router.post('/register', register);

// נתיב להתחברות
router.post('/login', login);

// נתיב לקבלת פרטי המשתמש המחובר
router.get('/me', auth, getMe);

// התנתקות
router.post('/logout', auth, logout);

export default router;