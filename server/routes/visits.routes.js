import express from 'express';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

// קבלת כל הביקורים
router.get('/', auth, async (req, res) => {
  try {
    res.json([]);  // כרגע מחזיר מערך ריק
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בקבלת הביקורים' });
  }
});

// קבלת סטטיסטיקות ביקורים
router.get('/stats', auth, async (req, res) => {
  try {
    // כרגע מחזיר נתוני דמה
    res.json({
      totalVisits: 0,
      completedVisits: 0,
      pendingVisits: 0,
      averageVisitDuration: 0,
      visitsThisWeek: 0,
      visitsLastWeek: 0
    });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בקבלת סטטיסטיקות' });
  }
});

// קבלת ביקורים דחופים
router.get('/urgent', auth, async (req, res) => {
  try {
    // כרגע מחזיר נתוני דמה
    res.json([
      {
        elder: {
          _id: '1',
          firstName: 'ישראל',
          lastName: 'ישראלי',
          address: 'רחוב הרצל 1, תל אביב'
        },
        lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // לפני 30 יום
        daysSinceLastVisit: 30
      }
    ]);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בקבלת ביקורים דחופים' });
  }
});

// קבלת ביקור ספציפי
router.get('/:id', auth, async (req, res) => {
  try {
    res.json({}); // כרגע מחזיר אובייקט ריק
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בקבלת הביקור' });
  }
});

// יצירת ביקור חדש
router.post('/', auth, async (req, res) => {
  try {
    res.status(201).json({}); // כרגע מחזיר אובייקט ריק
  } catch (error) {
    res.status(500).json({ message: 'שגיאה ביצירת הביקור' });
  }
});

// עדכון ביקור
router.put('/:id', auth, async (req, res) => {
  try {
    res.json({}); // כרגע מחזיר אובייקט ריק
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בעדכון הביקור' });
  }
});

// מחיקת ביקור
router.delete('/:id', auth, async (req, res) => {
  try {
    res.json({ message: 'הביקור נמחק בהצלחה' });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה במחיקת הביקור' });
  }
});

export default router; 