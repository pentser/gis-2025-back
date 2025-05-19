import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

// עדכון מיקום המשתמש לירושלים
async function updateAdminLocation() {
  try {
    // התחברות למסד הנתונים
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('מחובר למסד הנתונים MongoDB');

    // מציאת המשתמש
    const user = await User.findOne({ email: "admin@example.com" });
    
    if (!user) {
      console.log('משתמש admin@example.com לא נמצא');
      return;
    }
    
    console.log('נמצא משתמש:', user.email);
    console.log('פרטים נוכחיים:', {
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address,
      location: user.location
    });
    
    // עדכון הכתובת והמיקום לירושלים
    user.address = "ירושלים";
    user.location = {
      type: "Point",
      coordinates: [35.2137, 31.7683] // [longitude, latitude] של ירושלים
    };
    
    await user.save();
    
    console.log('המיקום עודכן בהצלחה!');
    console.log('פרטים מעודכנים:', {
      address: user.address,
      location: user.location
    });
    
  } catch (error) {
    console.error('שגיאה בעדכון המיקום:', error);
  } finally {
    // ניתוק ממסד הנתונים
    await mongoose.disconnect();
    console.log('מנותק ממסד הנתונים');
  }
}

// הפעלת הסקריפט
updateAdminLocation(); 