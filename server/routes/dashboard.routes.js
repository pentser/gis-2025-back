import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import Visit from '../models/visit.model.js';
import Elder from '../models/elderly.model.js';
import Volunteer from '../models/volunteer.model.js';
import User from '../models/user.model.js';

const router = express.Router();

// נתיב לקבלת נתוני לוח הבקרה
router.get('/', auth, async (req, res) => {
  try {
    // שליפת נתונים אמיתיים מהמסד נתונים
    const totalVisits = await Visit.countDocuments();
    const uniqueEldersCount = await Elder.countDocuments();
    
    // חישוב ממוצע אורך ביקור
    const visitsWithDuration = await Visit.find({
      previousVisit: { $exists: true },
      lastVisit: { $exists: true }
    });
    
    let averageVisitLength = 0;
    if (visitsWithDuration.length > 0) {
      const totalDuration = visitsWithDuration.reduce((sum, visit) => {
        const duration = visit.lastVisit - visit.previousVisit;
        return sum + (duration > 0 ? duration : 0);
      }, 0);
      averageVisitLength = totalDuration / visitsWithDuration.length;
    }
    
    // חישוב מספר הביקורים בשבוע האחרון
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const visitsThisWeek = await Visit.countDocuments({
      lastVisit: { $gte: oneWeekAgo }
    });
    
    res.json({
      totalVisits,
      uniqueEldersCount,
      averageVisitLength,
      visitsThisWeek
    });
  } catch (error) {
    console.error('שגיאה בקבלת נתוני לוח הבקרה:', error);
    res.status(500).json({ message: 'שגיאה בקבלת נתוני לוח הבקרה' });
  }
});

// נתיב לקבלת נתוני המפה
router.get('/map', auth, async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    
    // המרת הרדיוס למעלות (1 ק"מ = ~0.0089 מעלות)
    const radiusInDegrees = radius * 0.0089;
    
    // שליפת קשישים באזור
    const elderly = await Elder.find({
      'location.coordinates': {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInDegrees]
        }
      }
    }).populate('lastVisit');

    // שליפת מתנדבים באזור
    const volunteers = await User.find({
      role: 'volunteer',
      'location.coordinates': {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInDegrees]
        }
      }
    }).select('firstName lastName location status');

    // עיבוד הנתונים
    const processedElderly = elderly.map(elder => ({
      _id: elder._id,
      firstName: elder.firstName,
      lastName: elder.lastName,
      address: elder.address,
      location: elder.location,
      urgency: elder.urgency || 'medium',
      lastVisit: elder.lastVisit
    }));

    const processedVolunteers = volunteers.map(volunteer => ({
      _id: volunteer._id,
      firstName: volunteer.firstName,
      lastName: volunteer.lastName,
      location: volunteer.location,
      status: volunteer.status || 'available'
    }));

    res.json({
      elderly: processedElderly,
      volunteers: processedVolunteers
    });
  } catch (error) {
    console.error('שגיאה בקבלת נתוני מפה:', error);
    res.status(500).json({ 
      message: 'שגיאה בקבלת נתוני מפה',
      error: error.message 
    });
  }
});

// פונקציית עזר לחישוב מרחק בין שתי נקודות
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // רדיוס כדור הארץ בקילומטרים
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees) {
  return degrees * Math.PI / 180;
}

// עדכון סינון לפי סינון ביקור אחרון
const handleVisitFilter = (elderly, visitFilter) => {
  const now = new Date();
  return elderly.filter(elder => {
    const lastVisit = elder.lastVisit ? new Date(elder.lastVisit) : null;
    const daysSinceLastVisit = lastVisit 
      ? Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24))
      : Infinity;

    switch (visitFilter) {
      case 'recent':
        return daysSinceLastVisit <= 7;
      case 'week':
        return daysSinceLastVisit > 7;
      case 'twoWeeks':
        return daysSinceLastVisit > 14;
      default:
        return true;
    }
  });
};

export default router; 