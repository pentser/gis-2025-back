import express from 'express';
import { 
  getElderly,
  getNearbyElderly,
  createElderly,
  updateElderly,
  deleteElderly,
  getElderlyById
} from '../controllers/elderly.controller.js';
import { auth, adminAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// נתיבים לניהול קשישים
router.get('/', auth, getElderly);
router.get('/nearby', auth, getNearbyElderly);
router.get('/:id', auth, getElderlyById);
router.post('/', auth, createElderly);
router.patch('/:id', auth, updateElderly);
router.delete('/:id', adminAuth, deleteElderly); // רק מנהל יכול למחוק

export default router; 