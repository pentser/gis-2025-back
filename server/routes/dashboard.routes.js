import express from 'express';
import { auth } from '../middleware/auth.middleware.js';

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
router.get('/map', auth, async (req, res) => {
  try {
    const {
      radius = 10, // רדיוס בק"מ
      elderlyStatus, // סטטוס הזקנים (needs_visit, visited)
      volunteerStatus, // סטטוס המתנדבים (available, busy)
      lastVisitDays, // מספר ימים מביקור אחרון
      lat, // קו רוחב של המיקום הנוכחי
      lng // קו אורך של המיקום הנוכחי
    } = req.query;

    // כרגע מחזיר נתוני דמה מסוננים
    const mockData = {
      elderly: [
        {
          _id: '1',
          firstName: 'ישראל',
          lastName: 'ישראלי',
          address: 'רחוב הרצל 1, תל אביב',
          location: {
            type: 'Point',
            coordinates: [34.7818, 32.0853]
          },
          lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          status: 'needs_visit',
          distanceFromCurrentLocation: 2.5 // במידה ונשלחו קואורדינטות
        },
        {
          _id: '2',
          firstName: 'שרה',
          lastName: 'לוי',
          address: 'רחוב ביאליק 15, רמת גן',
          location: {
            type: 'Point',
            coordinates: [34.8246, 32.0837]
          },
          lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'visited',
          distanceFromCurrentLocation: 3.8
        }
      ],
      volunteers: [
        {
          _id: '1',
          firstName: 'משה',
          lastName: 'כהן',
          location: {
            type: 'Point',
            coordinates: [34.7728, 32.0673]
          },
          status: 'available',
          lastActive: new Date(),
          distanceFromCurrentLocation: 1.2
        },
        {
          _id: '2',
          firstName: 'רחל',
          lastName: 'גולדברג',
          location: {
            type: 'Point',
            coordinates: [34.7977, 32.0853]
          },
          status: 'busy',
          lastActive: new Date(Date.now() - 30 * 60 * 1000),
          distanceFromCurrentLocation: 4.1
        }
      ]
    };

    // הפעלת פילטרים על נתוני הדמה
    let filteredData = {
      elderly: [...mockData.elderly],
      volunteers: [...mockData.volunteers]
    };

    // פילטור לפי מרחק
    if (lat && lng && radius) {
      filteredData.elderly = filteredData.elderly.filter(
        elder => elder.distanceFromCurrentLocation <= radius
      );
      filteredData.volunteers = filteredData.volunteers.filter(
        volunteer => volunteer.distanceFromCurrentLocation <= radius
      );
    }

    // פילטור לפי סטטוס זקנים
    if (elderlyStatus) {
      filteredData.elderly = filteredData.elderly.filter(
        elder => elder.status === elderlyStatus
      );
    }

    // פילטור לפי סטטוס מתנדבים
    if (volunteerStatus) {
      filteredData.volunteers = filteredData.volunteers.filter(
        volunteer => volunteer.status === volunteerStatus
      );
    }

    // פילטור לפי תאריך ביקור אחרון
    if (lastVisitDays) {
      const cutoffDate = new Date(Date.now() - lastVisitDays * 24 * 60 * 60 * 1000);
      filteredData.elderly = filteredData.elderly.filter(
        elder => new Date(elder.lastVisit) <= cutoffDate
      );
    }

    res.json(filteredData);
  } catch (error) {
    console.error('שגיאה בקבלת נתוני המפה:', error);
    res.status(500).json({ message: 'שגיאה בקבלת נתוני המפה' });
  }
});

export default router; 