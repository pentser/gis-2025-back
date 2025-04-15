import express from 'express';
import {
  createVisit,
  getMyVisits,
  getElderVisits,
  getVisitStats,
  updateVisit,
  deleteVisit
} from '../controllers/visit.controller.js';
import { auth, adminAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// נתיבים לניהול ביקורים
router.post('/', auth, createVisit);
router.get('/my', auth, getMyVisits);
router.get('/stats', adminAuth, getVisitStats);
router.get('/elder/:elderId', auth, getElderVisits);
router.patch('/:id', auth, updateVisit);
router.delete('/:id', auth, deleteVisit);

export default router; 