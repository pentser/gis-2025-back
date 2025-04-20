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
    console.log('קבלת בקשה לנתוני מפה:', req.query);
    
    const { lat, lng, radius = 10, elderlyStatus, volunteerStatus, lastVisitDays } = req.query;
    
    // בדיקות תקינות
    if (!lat || !lng) {
      console.error('לא סופקו פרמטרים של lat ו-lng');
      return res.status(400).json({ 
        message: 'חסרים פרמטרים הכרחיים: lat ו-lng',
        query: req.query
      });
    }
    
    // המרת הרדיוס לרדיאנים (1 ק"מ = ~0.0089 מעלות)
    const radiusInDegrees = radius * 0.0089;
    
    // תיעוד במסד הנתונים
    console.log(`מחפש נתונים במיקום: [${lat}, ${lng}] עם רדיוס ${radius} ק"מ`);
    
    try {
      // מציאת זקנים באזור
      const elderly = await Elder.find({
        'location.coordinates': {
          $geoWithin: {
            $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInDegrees]
          }
        }
      }).populate('lastVisit');
      
      console.log(`נמצאו ${elderly.length} ערירים`);
      
      // מציאת מתנדבים באזור
      const volunteers = await Volunteer.find({
        'location.coordinates': {
          $geoWithin: {
            $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInDegrees]
          }
        }
      });
      
      console.log(`נמצאו ${volunteers.length} מתנדבים`);
      
      // בדיקת תקינות הנתונים שנמצאו
      if (!Array.isArray(elderly) || !Array.isArray(volunteers)) {
        throw new Error('התוצאות שהתקבלו ממסד הנתונים אינן תקינות');
      }

      // חישוב מרחקים ועיבוד נתונים
      const processedElderly = elderly.map(elder => {
        // וידוא שיש מיקום תקין
        if (!elder.location || !elder.location.coordinates || elder.location.coordinates.length < 2) {
          console.error('נמצא מיקום לא תקין של ערירי:', elder._id);
          return null; // דילוג על ערירי ללא מיקום תקין
        }
        
        // טיפול במקרה שאין תאריך ביקור אחרון
        let daysSinceLastVisit = Infinity;
        let lastVisitDate = null;
        
        if (elder.lastVisit) {
          lastVisitDate = elder.lastVisit.date || elder.lastVisit; // טיפול בשני מבנים אפשריים
          daysSinceLastVisit = Math.floor((Date.now() - new Date(lastVisitDate)) / (1000 * 60 * 60 * 24));
        }
        
        // קביעת סטטוס - מאפשר גם קשישים עם סטטוס visited שאין להם תאריך ביקור
        let status = 'needs_visit';
        if (elder.status === 'visited' || daysSinceLastVisit <= 14) {
          status = 'visited';
        }
        
        return {
          _id: elder._id,
          firstName: elder.firstName,
          lastName: elder.lastName,
          address: elder.address ? `${elder.address.street}, ${elder.address.city}` : 'כתובת לא ידועה',
          location: elder.location,
          status: status,
          lastVisit: lastVisitDate,
          daysSinceLastVisit: daysSinceLastVisit,
          distanceFromCurrentLocation: calculateDistance(
            lat, 
            lng, 
            elder.location.coordinates[1], 
            elder.location.coordinates[0]
          )
        };
      }).filter(elder => elder !== null); // סינון ערירים ללא מיקום תקין

      // פילטור לפי ימים מאז ביקור אחרון
      let filteredByLastVisit = processedElderly;
      if (lastVisitDays && parseInt(lastVisitDays) > 0) {
        const days = parseInt(lastVisitDays);
        filteredByLastVisit = processedElderly.filter(elder => {
          // אם אין תאריך ביקור, לא כולל בתוצאות
          if (!elder.lastVisit) return false;
          
          // מכליל רק אם מספר הימים מאז הביקור האחרון קטן או שווה למספר הימים שצוין
          return elder.daysSinceLastVisit <= days;
        });
        console.log(`סינון לפי ביקור אחרון (${days} ימים): ${filteredByLastVisit.length} קשישים`);
      }
      
      // פילטור לפי סטטוס קשישים
      let filteredElderly = filteredByLastVisit;
      if (elderlyStatus === 'needs_visit') {
        filteredElderly = filteredByLastVisit.filter(elder => elder.status === 'needs_visit');
        console.log(`סינון לפי 'זקוק לביקור': ${filteredElderly.length} קשישים`);
      } else if (elderlyStatus === 'visited') {
        filteredElderly = filteredByLastVisit.filter(elder => elder.status === 'visited');
        console.log(`סינון לפי 'ביקר לאחרונה': ${filteredElderly.length} קשישים`);
      }

      const processedVolunteers = volunteers.map(volunteer => {
        // וידוא שיש מיקום תקין
        if (!volunteer.location || !volunteer.location.coordinates || volunteer.location.coordinates.length < 2) {
          console.error('נמצא מיקום לא תקין של מתנדב:', volunteer._id);
          return null; // דילוג על מתנדב ללא מיקום תקין
        }
        
        return {
          _id: volunteer._id,
          firstName: volunteer.firstName,
          lastName: volunteer.lastName,
          location: volunteer.location,
          status: volunteer.status || 'available',
          lastActive: volunteer.lastActive || new Date(),
          distanceFromCurrentLocation: calculateDistance(
            lat,
            lng,
            volunteer.location.coordinates[1],
            volunteer.location.coordinates[0]
          )
        };
      }).filter(volunteer => volunteer !== null); // סינון מתנדבים ללא מיקום תקין

      // פילטור לפי סטטוס מתנדבים
      let filteredVolunteers = processedVolunteers;
      if (volunteerStatus === 'available') {
        filteredVolunteers = processedVolunteers.filter(volunteer => volunteer.status === 'available');
        console.log(`סינון לפי מתנדבים 'זמינים': ${filteredVolunteers.length} מתנדבים`);
      } else if (volunteerStatus === 'busy') {
        filteredVolunteers = processedVolunteers.filter(volunteer => volunteer.status === 'busy');
        console.log(`סינון לפי מתנדבים 'עסוקים': ${filteredVolunteers.length} מתנדבים`);
      }

      const result = {
        elderly: filteredElderly,
        volunteers: filteredVolunteers
      };
      
      console.log('מחזיר תשובה עם:', {
        elderlyCount: filteredElderly.length,
        volunteersCount: filteredVolunteers.length
      });
      
      res.json(result);
    } catch (dbError) {
      console.error('שגיאה בשאילתת מסד הנתונים:', dbError);
      throw dbError;
    }
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

export default router; 