import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

const initializeDb = async () => {
  try {
    // התחברות למסד הנתונים
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('מחובר למסד הנתונים');

    // בדיקה אם יש כבר משתמשים במערכת
    const usersCount = await User.countDocuments();
    if (usersCount > 0) {
      console.log('מסד הנתונים כבר מאותחל');
      await mongoose.disconnect();
      return;
    }

    // יצירת משתמש מנהל ראשוני
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    const adminUser = new User({
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'מנהל',
      lastName: 'ראשי',
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('משתמש מנהל נוצר בהצלחה');

    await mongoose.disconnect();
    console.log('התנתק ממסד הנתונים');
  } catch (error) {
    console.error('שגיאה באתחול מסד הנתונים:', error);
    process.exit(1);
  }
};

initializeDb(); 