import { Visit, Elderly } from '../models/index.js';

// יצירת ביקור חדש
export const createVisit = async (req, res) => {
  try {
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
    
    await visit.save();
    await visit.populate('elder volunteer');
    
    res.status(201).json(visit);
  } catch (error) {
    res.status(400).json({
      message: 'שגיאה ביצירת ביקור',
      error: error.message
    });
  }
};

// קבלת כל הביקורים של מתנדב
export const getMyVisits = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { volunteer: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const visits = await Visit.find(query)
      .populate('elder')
      .sort({ date: -1 });

    res.json(visits);
  } catch (error) {
    res.status(500).json({
      message: 'שגיאה בקבלת רשימת ביקורים'
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