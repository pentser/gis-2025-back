import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import { getVolunteers } from '../controllers/volunteer.controller.js';

const router = express.Router();

// קבלת רשימת המתנדבים
router.get('/', auth, getVolunteers);

export default router; 