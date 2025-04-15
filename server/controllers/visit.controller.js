import { Visit, Elderly } from '../models/index.js';

// יצירת ביקור חדש
export const createVisit = async (req, res) => {
  try {
    const visit = new Visit({
      ...req.body,
      volunteer: req.volunteer._id
    });
    
    await visit.save();

    // עדכון תאריך ביקור אחרון בפרטי הקשיש
    await Elderly.findByIdAndUpdate(req.body.elder, {
      lastVisit: visit.lastVisit,
      visitSummary: visit.visitSummary
    });

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
    const query = { volunteer: req.volunteer._id };

    if (startDate || endDate) {
      query.lastVisit = {};
      if (startDate) query.lastVisit.$gte = new Date(startDate);
      if (endDate) query.lastVisit.$lte = new Date(endDate);
    }

    const visits = await Visit.find(query)
      .populate('elder')
      .sort({ lastVisit: -1 });

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
      .sort({ lastVisit: -1 });

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
            $subtract: ['$lastVisit', '$previousVisit'] 
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
    const updates = Object.keys(req.body);
    const allowedUpdates = ['lastVisit', 'previousVisit', 'visitSummary'];
    
    const isValidOperation = updates.every(update => 
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: 'עדכונים לא חוקיים' });
    }

    const visit = await Visit.findOne({
      _id: req.params.id,
      volunteer: req.volunteer._id
    });

    if (!visit) {
      return res.status(404).json({ message: 'ביקור לא נמצא' });
    }

    updates.forEach(update => visit[update] = req.body[update]);
    await visit.save();

    // עדכון פרטי הקשיש אם נדרש
    if (updates.includes('lastVisit') || updates.includes('visitSummary')) {
      await Elderly.findByIdAndUpdate(visit.elder, {
        lastVisit: visit.lastVisit,
        visitSummary: visit.visitSummary
      });
    }

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
      volunteer: req.volunteer._id
    });

    if (!visit) {
      return res.status(404).json({ message: 'ביקור לא נמצא' });
    }

    res.json({ message: 'ביקור נמחק בהצלחה' });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה במחיקת ביקור' });
  }
}; 