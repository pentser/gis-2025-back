import { Elderly } from '../models/index.js';
import mongoose from 'mongoose';
import { createLinkedElderly, findElderlyByUserId, updateElderlyByUserId } from '../utils/userElderlyLink.js';

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
    // בדיקה אם מדובר בקשיש שגם יהיה משתמש מערכת
    if (req.body.createUser) {
      const { email, password, firstName, lastName, address, phone } = req.body;
      
      // וידוא שכל השדות הנדרשים למשתמש קיימים
      if (!email || !password) {
        return res.status(400).json({ 
          message: 'חסרים פרטי משתמש (אימייל/סיסמה) ליצירת משתמש' 
        });
      }
      
      // יצירת נתוני משתמש
      const userData = {
        email,
        password,
        firstName,
        lastName,
        role: 'elderly',
        address: address?.street || ''
      };
      
      // הסרת שדות המשתמש מהבקשה
      const { createUser, email: _, password: __, ...elderlyData } = req.body;
      
      try {
        // יצירת משתמש וקשיש מקושרים
        const { user, elderly } = await createLinkedElderly(userData, elderlyData);
        
        res.status(201).json({
          message: 'קשיש ומשתמש נוצרו בהצלחה',
          user: {
            id: user._id,
            email: user.email,
            role: user.role
          },
          elderly
        });
      } catch (error) {
        console.error('שגיאה ביצירת קשיש ומשתמש:', error);
        res.status(400).json({ 
          message: 'שגיאה ביצירת קשיש ומשתמש',
          error: error.message 
        });
      }
    } else {
      // יצירת קשיש רגיל (ללא משתמש מקושר)
      const elderly = new Elderly(req.body);
      await elderly.save();
      res.status(201).json(elderly);
    }
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
      'location', 'needs', 'emergencyContact', 'status',
      'medicalInfo', 'preferences', 'idNumber', 'birthDate'
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

    // אם יש משתמש מקושר, עדכן גם אותו
    if (elderly.user) {
      try {
        // הכן את הנתונים שצריך לעדכן במשתמש
        const userUpdates = {};
        
        if (req.body.firstName) userUpdates.firstName = req.body.firstName;
        if (req.body.lastName) userUpdates.lastName = req.body.lastName;
        
        if (req.body.address && req.body.address.street) {
          userUpdates.address = req.body.address.street;
          
          if (req.body.address.city) {
            userUpdates.address += ', ' + req.body.address.city;
          }
        }
        
        if (req.body.location) {
          userUpdates.location = req.body.location;
        }
        
        // עדכן את המשתמש רק אם יש שדות לעדכן
        if (Object.keys(userUpdates).length > 0) {
          const User = mongoose.model('User');
          await User.findByIdAndUpdate(
            elderly.user,
            userUpdates,
            { new: true, runValidators: true }
          );
        }
      } catch (userUpdateError) {
        console.error('שגיאה בעדכון המשתמש המקושר:', userUpdateError);
        // נמשיך גם אם יש שגיאה בעדכון המשתמש
      }
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
    const elderly = await Elderly.findById(req.params.id);
    
    if (!elderly) {
      return res.status(404).json({ message: 'קשיש לא נמצא' });
    }
    
    // אם יש משתמש מקושר, נמחק גם אותו
    const userId = elderly.user;
    
    // מחיקת הקשיש
    await Elderly.deleteOne({ _id: req.params.id });
    
    // אם יש משתמש מקושר, מחק גם אותו
    if (userId) {
      try {
        const User = mongoose.model('User');
        await User.deleteOne({ _id: userId });
        console.log(`Linked user ${userId} deleted`);
      } catch (userDeleteError) {
        console.error('שגיאה במחיקת המשתמש המקושר:', userDeleteError);
        // נמשיך גם אם יש שגיאה במחיקת המשתמש
      }
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