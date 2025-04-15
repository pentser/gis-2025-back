import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import Visit from '../models/visit.model.js';
import Elder from '../models/elderly.model.js';
import Volunteer from '../models/volunteer.model.js';

const router = express.Router();

// נתיב לקבלת נתוני לוח הבקרה
router.get('/', auth, async (req, res) => {
  try {
    // כרגע מחזיר נתוני דמה
    res.json({
      totalVisits: 0,
      uniqueEldersCount: 0,
      averageVisitLength: 0,
      visitsThisWeek: 0
    });
  } catch (error) {
    console.error('שגיאה בקבלת נתוני לוח הבקרה:', error);
    res.status(500).json({ message: 'שגיאה בקבלת נתוני לוח הבקרה' });
  }
});

// נתיב לקבלת נתוני המפה
router.get('/map', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    
    // המרת הרדיוס לרדיאנים (1 ק"מ = ~0.0089 מעלות)
    const radiusInDegrees = radius * 0.0089;
    
    // מציאת זקנים באזור
    const elderly = await Elder.find({
      'location.coordinates': {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInDegrees]
        }
      }
    }).populate('lastVisit');

    // מציאת מתנדבים באזור
    const volunteers = await Volunteer.find({
      'location.coordinates': {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInDegrees]
        }
      }
    });

    // חישוב מרחקים ועיבוד נתונים
    const processedElderly = elderly.map(elder => {
      const daysSinceLastVisit = elder.lastVisit 
        ? Math.floor((Date.now() - new Date(elder.lastVisit.date)) / (1000 * 60 * 60 * 24))
        : Infinity;
        
      return {
        _id: elder._id,
        firstName: elder.firstName,
        lastName: elder.lastName,
        address: elder.address,
        location: elder.location,
        status: daysSinceLastVisit > 14 ? 'needs_visit' : 'visited',
        lastVisit: elder.lastVisit ? elder.lastVisit.date : null,
        distanceFromCurrentLocation: calculateDistance(
          lat, 
          lng, 
          elder.location.coordinates[1], 
          elder.location.coordinates[0]
        )
      };
    });

    const processedVolunteers = volunteers.map(volunteer => ({
      _id: volunteer._id,
      firstName: volunteer.firstName,
      lastName: volunteer.lastName,
      location: volunteer.location,
      status: volunteer.status,
      lastActive: volunteer.lastActive,
      distanceFromCurrentLocation: calculateDistance(
        lat,
        lng,
        volunteer.location.coordinates[1],
        volunteer.location.coordinates[0]
      )
    }));

    res.json({
      elderly: processedElderly,
      volunteers: processedVolunteers
    });
  } catch (error) {
    console.error('שגיאה בקבלת נתוני מפה:', error);
    res.status(500).json({ message: 'שגיאה בקבלת נתוני מפה' });
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

export default router; 