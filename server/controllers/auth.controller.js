import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

// הרשמת משתמש חדש
export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // בדיקה אם המשתמש כבר קיים
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'משתמש עם אימייל זה כבר קיים במערכת' });
    }

    // הצפנת הסיסמה
    const hashedPassword = await bcrypt.hash(password, 12);

    // יצירת משתמש חדש
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      isActive: true
    });

    // יצירת טוקן
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בהרשמה', error: error.message });
  }
};

// התחברות משתמש
export const login = async (req, res) => {
  try {
    console.log('קיבלתי בקשת התחברות:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('חסרים פרטי התחברות');
      return res.status(400).json({ message: 'נדרש אימייל וסיסמה' });
    }

    // בדיקת קיום המשתמש
    const user = await User.findOne({ email });
    if (!user) {
      console.log('משתמש לא נמצא:', email);
      return res.status(404).json({ message: 'משתמש לא נמצא' });
    }

    // בדיקת סטטוס פעיל
    if (!user.isActive) {
      console.log('משתמש לא פעיל:', email);
      return res.status(403).json({ message: 'המשתמש אינו פעיל' });
    }

    // בדיקת סיסמה
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('סיסמה שגויה עבור משתמש:', email);
      return res.status(401).json({ message: 'סיסמה שגויה' });
    }

    // יצירת טוקן
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // שמירת הטוקן במשתמש
    user.tokens = user.tokens || [];
    user.tokens.push(token);
    await user.save();

    console.log('התחברות מוצלחת:', email);

    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };

    console.log('שולח תגובה:', { token, user: userResponse });

    return res.status(200).json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('שגיאה בהתחברות:', error);
    return res.status(500).json({ 
      message: 'שגיאה בהתחברות',
      error: error.message 
    });
  }
};

// קבלת פרופיל משתמש
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'משתמש לא נמצא' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'שגיאה בקבלת פרופיל', error: error.message });
  }
};

// קבלת פרטי המשתמש המחובר
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'משתמש לא נמצא' });
    }
    res.json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'שגיאת שרת', error: error.message });
  }
};

// התנתקות
export const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      token => token !== req.token
    );
    await req.user.save();
    res.json({ message: 'התנתקת בהצלחה' });
  } catch (error) {
    res.status(500).json({ 
      message: 'שגיאה בהתנתקות' 
    });
  }
}; 