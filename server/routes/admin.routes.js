import express from 'express';
import { auth, isAdmin } from '../middleware/auth.js';
import User from '../models/user.model.js';
import Visit from '../models/visit.model.js';

const router = express.Router();

// קבלת כל המתנדבים עם מספר הביקורים שלהם
router.get('/volunteers', [auth, isAdmin], async (req, res) => {
  try {
    console.log('מקבל בקשה לשליפת מתנדבים');
    
    // מביא את כל המשתמשים שהם מתנדבים
    const volunteers = await User.find({ role: 'volunteer' })
      .select('firstName lastName phone address email');

    console.log('נמצאו מתנדבים:', volunteers.length);

    // מביא את מספר הביקורים לכל מתנדב
    const volunteersWithVisits = await Promise.all(
      volunteers.map(async (volunteer) => {
        const visitsCount = await Visit.countDocuments({ volunteer: volunteer._id });
        return {
          ...volunteer.toObject(),
          visitsCount
        };
      })
    );

    res.json(volunteersWithVisits);
  } catch (error) {
    console.error('שגיאה בשליפת מתנדבים:', error);
    res.status(500).json({ message: 'שגיאה בשליפת מתנדבים' });
  }
});

export default router; 