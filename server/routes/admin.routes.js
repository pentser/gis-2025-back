import express from 'express';
import { auth, isAdmin } from '../middleware/auth.js';
import User from '../models/user.model.js';
import Visit from '../models/visit.model.js';
import Elderly from '../models/elderly.model.js';

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

// נתיב חדש למפת האדמין
router.get('/map', auth, isAdmin, async (req, res) => {
  try {
    // שליפת כל הקשישים
    const elderly = await Elderly.find({}).select('firstName lastName address location status');
    
    // שליפת כל המתנדבים
    const volunteers = await User.find({ role: 'volunteer' })
      .select('firstName lastName location status');

    res.json({
      elderly: elderly.map(elder => ({
        ...elder.toObject(),
        urgency: calculateUrgency(elder) // פונקציית עזר לחישוב דחיפות
      })),
      volunteers: volunteers.map(volunteer => ({
        ...volunteer.toObject(),
        // אפשר להוסיף כאן מידע נוסף על המתנדב
      }))
    });
  } catch (error) {
    console.error('שגיאה בשליפת נתוני מפת אדמין:', error);
    res.status(500).json({ message: 'שגיאה בשליפת נתוני המפה' });
  }
});

// פונקציית עזר לחישוב דחיפות הביקור
const calculateUrgency = (elder) => {
  // כאן תוכל להוסיף לוגיקה לחישוב דחיפות הביקור
  // לדוגמה: על סמך תאריך הביקור האחרון
  return 'medium'; // ערך ברירת מחדל
};

router.get('/dashboard', auth, isAdmin, async (req, res) => {
  try {
    console.log('Fetching dashboard data...');
    
    // ביצוע כל הקריאות במקביל
    const [stats, elderly, volunteers, urgentVisits] = await Promise.all([
      // סטטיסטיקות
      Visit.aggregate([
        {
          $facet: {
            totalVisits: [{ $count: "count" }],
            activeElderly: [
              { $group: { _id: "$elder" } },
              { $count: "count" }
            ],
            visitsThisWeek: [
              {
                $match: {
                  date: { 
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                  }
                }
              },
              { $count: "count" }
            ]
          }
        }
      ]),
      
      // קשישים
      Elderly.find({})
        .select('firstName lastName address location status')
        .lean(),
      
      // מתנדבים
      User.find({ role: 'volunteer' })
        .select('firstName lastName location status')
        .lean(),

      // ביקורים דחופים
      Visit.find({
        date: { 
          $lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) 
        }
      })
      .populate('elder', 'firstName lastName address')
      .lean()
    ]);

    // עיבוד נתוני הקשישים
    const processedElderly = elderly.map(elder => ({
      id: elder._id.toString(),
      firstName: elder.firstName,
      lastName: elder.lastName,
      address: elder.address,
      location: elder.location?.coordinates 
        ? [elder.location.coordinates[1], elder.location.coordinates[0]]
        : null,
      status: elder.status,
      urgency: calculateUrgency(elder)
    }));

    // עיבוד נתוני המתנדבים
    const processedVolunteers = volunteers.map(volunteer => ({
      id: volunteer._id.toString(),
      firstName: volunteer.firstName,
      lastName: volunteer.lastName,
      location: volunteer.location?.coordinates 
        ? [volunteer.location.coordinates[1], volunteer.location.coordinates[0]]
        : null,
      status: volunteer.status || 'available'
    }));

    // עיבוד הנתונים למבנה הרצוי
    const formattedStats = {
      totalVisits: stats[0].totalVisits[0]?.count || 0,
      activeElderly: stats[0].activeElderly[0]?.count || 0,
      visitsThisWeek: stats[0].visitsThisWeek[0]?.count || 0,
      activeVolunteers: processedVolunteers.length
    };

    // הוספת לוג לבדיקת הנתונים
    console.log('Sending dashboard data:', {
      stats: formattedStats,
      mapData: {
        elderly: processedElderly.length,
        volunteers: processedVolunteers.length
      }
    });

    res.json({
      stats: formattedStats,
      mapData: {
        elderly: processedElderly,
        volunteers: processedVolunteers
      },
      urgentVisits: urgentVisits.map(visit => ({
        ...visit.toObject(),
        elder: {
          ...visit.elder.toObject(),
          id: visit.elder._id.toString()
        }
      }))
    });

  } catch (error) {
    console.error('שגיאה בשליפת נתוני דשבורד:', error);
    res.status(500).json({ 
      message: 'שגיאה בטעינת נתוני הדשבורד',
      error: error.message 
    });
  }
});

export default router; 