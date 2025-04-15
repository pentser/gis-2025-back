import { Elderly } from '../models/index.js';

// קבלת כל הקשישים עם אפשרות לסינון
export const getElderly = async (req, res) => {
  try {
    const { city, status, search } = req.query;
    const query = {};

    if (city) query['address.city'] = city;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { 'address.street': { $regex: search, $options: 'i' } }
      ];
    }

    const elderly = await Elderly.find(query).sort({ lastName: 1 });
    res.json(elderly);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בקבלת רשימת קשישים' });
  }
};

// קבלת קשישים בקרבת מיקום
export const getNearbyElderly = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query; // מרחק במטרים

    const elderly = await Elderly.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });

    res.json(elderly);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בחיפוש קשישים לפי מיקום' });
  }
};

// הוספת קשיש חדש
export const createElderly = async (req, res) => {
  try {
    const elderly = new Elderly(req.body);
    await elderly.save();
    res.status(201).json(elderly);
  } catch (error) {
    res.status(400).json({ 
      message: 'שגיאה ביצירת קשיש חדש',
      error: error.message 
    });
  }
};

// עדכון פרטי קשיש
export const updateElderly = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'address', 
      'location', 'needs', 'emergencyContact', 'status'
    ];
    
    const isValidOperation = updates.every(update => 
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: 'עדכונים לא חוקיים' });
    }

    const elderly = await Elderly.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!elderly) {
      return res.status(404).json({ message: 'קשיש לא נמצא' });
    }

    res.json(elderly);
  } catch (error) {
    res.status(400).json({ 
      message: 'שגיאה בעדכון פרטי קשיש',
      error: error.message 
    });
  }
};

// מחיקת קשיש
export const deleteElderly = async (req, res) => {
  try {
    const elderly = await Elderly.findByIdAndDelete(req.params.id);
    
    if (!elderly) {
      return res.status(404).json({ message: 'קשיש לא נמצא' });
    }

    res.json({ message: 'קשיש נמחק בהצלחה' });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה במחיקת קשיש' });
  }
};

// קבלת פרטי קשיש בודד
export const getElderlyById = async (req, res) => {
  try {
    const elderly = await Elderly.findById(req.params.id);
    
    if (!elderly) {
      return res.status(404).json({ message: 'קשיש לא נמצא' });
    }

    res.json(elderly);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בקבלת פרטי קשיש' });
  }
}; 