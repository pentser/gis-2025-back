import { Visit, Elderly } from '../models/index.js';
import mongoose from 'mongoose';

// יצירת ביקור חדש
export const createVisit = async (req, res) => {
  try {
    console.log('מקבל בקשה ליצירת ביקור:', req.body);
    const { elder, date, duration, status, notes } = req.body;
    
    if (!elder) {
      return res.status(400).json({ message: 'נדרש לציין קשיש' });
    }

    const visit = new Visit({
      elder,
      volunteer: req.user._id,
      date,
      duration,
      status,
      notes
    });
    
    console.log('שומר ביקור חדש:', visit);
    await visit.save();
    await visit.populate('elder volunteer');
    console.log('ביקור נשמר בהצלחה:', visit);
    
    res.status(201).json(visit);
  } catch (error) {
    console.error('שגיאה ביצירת ביקור:', error);
    res.status(400).json({
      message: 'שגיאה ביצירת ביקור',
      error: error.message
    });
  }
};

// קבלת כל הביקורים של מתנדב
export const getMyVisits = async (req, res) => {
  try {
    console.log('התקבלה בקשה לקבלת ביקורים');
    console.log('מידע על המשתמש:', req.user);
    console.log('headers:', req.headers);

    if (!req.user || !req.user._id) {
      console.error('לא נמצא משתמש מחובר');
      return res.status(401).json({ message: 'משתמש לא מחובר' });
    }

    console.log('מקבל בקשה לביקורים של מתנדב:', req.user._id);
    console.log('Query params:', req.query);
    
    const { startDate, endDate } = req.query;
    const query = { volunteer: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
        console.log('תאריך התחלה:', query.date.$gte);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
        console.log('תאריך סיום:', query.date.$lte);
      }
    }

    console.log('מחפש ביקורים עם query:', JSON.stringify(query));
    
    // בדיקה שהמשתמש קיים במערכת
    const Visit = mongoose.model('Visit');
    const visitsCount = await Visit.countDocuments(query);
    console.log('מספר ביקורים שנמצאו במערכת:', visitsCount);
    
    let visits = await Visit.find(query)
      .populate({
        path: 'elder',
        select: '-__v'
      })
      .populate({
        path: 'volunteer',
        select: '-password -__v'
      })
      .sort({ date: -1 })
      .lean();

    console.log('סוג הנתונים שנמצאו:', typeof visits, Array.isArray(visits));
    console.log('נמצאו ביקורים:', visits?.length);
    
    // וידוא שהתוצאה היא מערך
    if (!Array.isArray(visits)) {
      console.error('התוצאה אינה מערך, ממיר למערך ריק');
      visits = [];
    }

    // בדיקת תקינות כל ביקור
    const validVisits = visits.filter(visit => {
      if (!visit) {
        console.log('נמצא ביקור null או undefined');
        return false;
      }

      const isValid = visit.elder && visit.date && visit.duration;
      if (!isValid) {
        console.log('נמצא ביקור לא תקין:', JSON.stringify(visit));
      } else {
        console.log('נמצא ביקור תקין:', JSON.stringify({
          id: visit._id,
          elder: visit.elder._id,
          date: visit.date,
          duration: visit.duration
        }));
      }
      return isValid;
    });

    console.log('מספר ביקורים תקינים:', validVisits.length);
    if (validVisits.length > 0) {
      console.log('דוגמה לביקור תקין:', JSON.stringify(validVisits[0]));
    } else {
      console.log('לא נמצאו ביקורים תקינים');
    }

    return res.json(validVisits);
  } catch (error) {
    console.error('שגיאה בקבלת רשימת ביקורים:', error);
    return res.status(500).json({
      message: 'שגיאה בקבלת רשימת ביקורים',
      error: error.message
    });
  }
};

// קבלת כל הביקורים של קשיש
export const getElderVisits = async (req, res) => {
  try {
    const visits = await Visit.find({ elder: req.params.elderId })
      .populate('volunteer', '-password')
      .sort({ date: -1 });

    res.json(visits);
  } catch (error) {
    res.status(500).json({
      message: 'שגיאה בקבלת רשימת ביקורים'
    });
  }
};

// קבלת סטטיסטיקות ביקורים
export const getVisitStats = async (req, res) => {
  try {
    const stats = await Visit.aggregate([
      {
        $group: {
          _id: null,
          totalVisits: { $sum: 1 },
          averageVisitLength: { $avg: { 
            $subtract: ['$date', '$previousDate'] 
          }},
          uniqueElders: { $addToSet: '$elder' }
        }
      },
      {
        $project: {
          _id: 0,
          totalVisits: 1,
          averageVisitLength: 1,
          uniqueEldersCount: { $size: '$uniqueElders' }
        }
      }
    ]);

    res.json(stats[0] || {
      totalVisits: 0,
      averageVisitLength: 0,
      uniqueEldersCount: 0
    });
  } catch (error) {
    res.status(500).json({
      message: 'שגיאה בקבלת סטטיסטיקות'
    });
  }
};

// עדכון פרטי ביקור
export const updateVisit = async (req, res) => {
  try {
    const { date, duration, status, notes } = req.body;
    const updates = { date, duration, status, notes };
    
    const visit = await Visit.findOne({
      _id: req.params.id,
      volunteer: req.user._id
    });

    if (!visit) {
      return res.status(404).json({ message: 'ביקור לא נמצא' });
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        visit[key] = updates[key];
      }
    });

    await visit.save();
    await visit.populate('elder volunteer');
    
    res.json(visit);
  } catch (error) {
    res.status(400).json({
      message: 'שגיאה בעדכון ביקור',
      error: error.message
    });
  }
};

// מחיקת ביקור
export const deleteVisit = async (req, res) => {
  try {
    const visit = await Visit.findOneAndDelete({
      _id: req.params.id,
      volunteer: req.user._id
    });

    if (!visit) {
      return res.status(404).json({ message: 'ביקור לא נמצא' });
    }

    res.json({ message: 'ביקור נמחק בהצלחה' });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה במחיקת ביקור' });
  }
}; 