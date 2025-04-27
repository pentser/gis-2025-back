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
    const elderly = await Elderly.find({})
      .select('firstName lastName address location status');
    
    // שליפת כל המתנדבים
    const volunteers = await User.find({ role: 'volunteer' })
      .select('firstName lastName location status');

    console.log('Found elderly:', elderly.length);
    console.log('Found volunteers:', volunteers.length);

    // חישוב דחיפות לכל הקשישים ועיבוד הקואורדינטות
    const elderlyWithUrgency = await Promise.all(
      elderly.map(async (elder) => {
        const elderObj = elder.toObject();
        
        // בדיקה שיש מיקום תקין
        let location = null;
        if (elderObj.location && 
            elderObj.location.type === 'Point' && 
            Array.isArray(elderObj.location.coordinates) && 
            elderObj.location.coordinates.length === 2) {
          // המרה מ-[longitude, latitude] ל-[latitude, longitude]
          location = [elderObj.location.coordinates[1], elderObj.location.coordinates[0]];
          console.log(`Valid location found for elderly ${elderObj._id}:`, location);
        } else {
          console.log(`Invalid location for elderly ${elderObj._id}:`, elderObj.location);
        }

        const urgency = await calculateUrgency(elder);
        
        return {
          ...elderObj,
          location,
          urgency
        };
      })
    );

    // עיבוד נתוני המתנדבים והקואורדינטות שלהם
    const processedVolunteers = volunteers.map(volunteer => {
      const volunteerObj = volunteer.toObject();
      
      // בדיקה שיש מיקום תקין
      let location = null;
      if (volunteerObj.location && 
          volunteerObj.location.type === 'Point' && 
          Array.isArray(volunteerObj.location.coordinates) && 
          volunteerObj.location.coordinates.length === 2) {
        // המרה מ-[longitude, latitude] ל-[latitude, longitude]
        location = [volunteerObj.location.coordinates[1], volunteerObj.location.coordinates[0]];
        console.log(`Valid location found for volunteer ${volunteerObj._id}:`, location);
      } else {
        console.log(`Invalid location for volunteer ${volunteerObj._id}:`, volunteerObj.location);
      }

      return {
        ...volunteerObj,
        location
      };
    });

    // הדפסת סיכום
    console.log('Summary:', {
      totalElderly: elderly.length,
      elderlyWithLocation: elderlyWithUrgency.filter(e => e.location).length,
      totalVolunteers: volunteers.length,
      volunteersWithLocation: processedVolunteers.filter(v => v.location).length
    });

    // הדפסת דוגמה של קשיש ומתנדב ראשונים עם המיקומים שלהם
    if (elderlyWithUrgency.length > 0) {
      const firstElder = elderlyWithUrgency[0];
      console.log('Sample elderly:', {
        id: firstElder._id,
        name: `${firstElder.firstName} ${firstElder.lastName}`,
        location: firstElder.location,
        originalLocation: elderly[0].location,
        urgency: firstElder.urgency
      });
    }

    if (processedVolunteers.length > 0) {
      const firstVolunteer = processedVolunteers[0];
      console.log('Sample volunteer:', {
        id: firstVolunteer._id,
        name: `${firstVolunteer.firstName} ${firstVolunteer.lastName}`,
        location: firstVolunteer.location,
        originalLocation: volunteers[0].location
      });
    }

    res.json({
      elderly: elderlyWithUrgency,
      volunteers: processedVolunteers
    });
  } catch (error) {
    console.error('שגיאה בשליפת נתוני מפת אדמין:', error);
    console.error(error.stack);
    res.status(500).json({ message: 'שגיאה בשליפת נתוני המפה' });
  }
});

// פונקציית עזר לחישוב דחיפות הביקור
const calculateUrgency = async (elder) => {
  try {
    // מצא את הביקור האחרון של הקשיש
    const lastVisit = await Visit.findOne({ 
      elder: elder._id,
      status: 'completed'
    })
    .sort({ date: -1 })
    .lean();

    if (!lastVisit) {
      return 'high'; // אם אין ביקורים, דחיפות גבוהה
    }

    const daysSinceLastVisit = Math.floor(
      (new Date() - new Date(lastVisit.date)) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastVisit > 21) return 'high';
    if (daysSinceLastVisit > 14) return 'medium';
    return 'low';
  } catch (error) {
    console.error('שגיאה בחישוב דחיפות:', error);
    return 'medium'; // ברירת מחדל במקרה של שגיאה
  }
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