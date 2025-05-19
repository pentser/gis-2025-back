import express from 'express';
import { auth } from '../middleware/auth.js';
import { 
  getVisits, 
  createVisit,
  updateVisit,
  deleteVisit
} from '../controllers/visit.controller.js';

const router = express.Router();

// הוספת middleware האימות לכל הנתיבים
router.get('/', auth, getVisits);
router.post('/', auth, createVisit);
router.put('/:id', auth, updateVisit);
router.delete('/:id', auth, deleteVisit);

export default router; 