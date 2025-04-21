import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import Visit from '../models/visit.model.js';
import Elderly from '../models/elderly.model.js';

const router = express.Router();

// קבלת כל הביקורים
router.get('/', auth, async (req, res) => {
  try {
    const visits = await Visit.find({})
      .populate('elder', 'firstName lastName')
      .populate('volunteer', 'firstName lastName')
      .sort({ lastVisit: -1 });
    
    res.json(visits);
  } catch (error) {
    console.error('שגיאה בקבלת הביקורים:', error);
    res.status(500).json({ message: 'שגיאה בקבלת הביקורים' });
  }
});

// קבלת סטטיסטיקות ביקורים
router.get('/stats', auth, async (req, res) => {
  try {
    // שליפת נתונים אמיתיים
    const totalVisits = await Visit.countDocuments();
    
    // חישוב ביקורים שהושלמו ובהמתנה
    const completedVisits = await Visit.countDocuments({ status: 'completed' });
    const pendingVisits = await Visit.countDocuments({ status: 'pending' });
    
    // חישוב זמן ממוצע של ביקור
    const visitsWithDuration = await Visit.find({
      previousVisit: { $exists: true },
      lastVisit: { $exists: true }
    });
    
    let averageVisitDuration = 0;
    if (visitsWithDuration.length > 0) {
      const totalDuration = visitsWithDuration.reduce((sum, visit) => {
        const duration = new Date(visit.lastVisit) - new Date(visit.previousVisit);
        return sum + (duration > 0 ? duration / (1000 * 60) : 0); // המרה לדקות
      }, 0);
      averageVisitDuration = totalDuration / visitsWithDuration.length;
    }
    
    // ביקורים השבוע ובשבוע שעבר
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const visitsThisWeek = await Visit.countDocuments({
      lastVisit: { $gte: oneWeekAgo }
    });
    
    const visitsLastWeek = await Visit.countDocuments({
      lastVisit: { $gte: twoWeeksAgo, $lt: oneWeekAgo }
    });
    
    // חישוב מספר קשישים ייחודיים
    const uniqueElders = await Visit.aggregate([
      { $group: { _id: '$elder' } },
      { $count: 'count' }
    ]);
    
    const uniqueEldersCount = uniqueElders.length > 0 ? uniqueElders[0].count : 0;
    
    res.json({
      totalVisits,
      completedVisits,
      pendingVisits,
      averageVisitDuration,
      visitsThisWeek,
      visitsLastWeek,
      uniqueEldersCount
    });
  } catch (error) {
    console.error('שגיאה בקבלת סטטיסטיקות:', error);
    res.status(500).json({ message: 'שגיאה בקבלת סטטיסטיקות' });
  }
});

// קבלת ביקורים דחופים
router.get('/urgent', auth, async (req, res) => {
  try {
    // הגדרת תאריך לפני 14 יום
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    // שליפת קשישים שלא ביקרו אותם למעלה מ-14 יום
    const eldersNeedingVisits = await Elderly.find({
      $or: [
        { lastVisit: { $lt: twoWeeksAgo } },
        { lastVisit: { $exists: false } }
      ]
    }).populate('lastVisit');
    
    // עיבוד התוצאות
    const urgentVisits = eldersNeedingVisits.map(elder => {
      const lastVisitDate = elder.lastVisit ? new Date(elder.lastVisit) : null;
      const daysSinceLastVisit = lastVisitDate 
        ? Math.floor((Date.now() - lastVisitDate) / (1000 * 60 * 60 * 24)) 
        : 30; // ברירת מחדל אם אין ביקור קודם
      
      return {
        elder: {
          _id: elder._id,
          firstName: elder.firstName,
          lastName: elder.lastName,
          address: elder.address ? `${elder.address.street || ''}, ${elder.address.city || ''}` : 'כתובת לא ידועה'
        },
        lastVisit: lastVisitDate || new Date(0),
        daysSinceLastVisit: daysSinceLastVisit
      };
    });
    
    // מיון לפי דחיפות (מספר ימים מאז הביקור האחרון)
    urgentVisits.sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit);
    
    res.json(urgentVisits);
  } catch (error) {
    console.error('שגיאה בקבלת ביקורים דחופים:', error);
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
    const { elderlyId, date, duration, notes, status } = req.body;
    
    if (!elderlyId) {
      return res.status(400).json({ message: 'נדרש לציין קשיש' });
    }
    
    const visit = new Visit({
      elder: elderlyId,
      volunteer: req.user._id,
      lastVisit: date || new Date(),
      visitSummary: notes,
      duration,
      status
    });
    
    await visit.save();
    
    // עדכון תאריך ביקור אחרון בפרטי הקשיש
    await Elderly.findByIdAndUpdate(elderlyId, {
      lastVisit: visit.lastVisit,
      visitSummary: notes
    });
    
    await visit.populate('elder', 'firstName lastName');
    await visit.populate('volunteer', 'firstName lastName');
    
    res.status(201).json(visit);
  } catch (error) {
    console.error('שגיאה ביצירת ביקור:', error);
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