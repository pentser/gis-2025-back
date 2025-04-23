import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createLinkedVolunteer, findVolunteerByUserId, updateVolunteerByUserId } from '../utils/userVolunteerLink.js';

dotenv.config();

// פונקציה להמרת כתובת לקואורדינטות
const geocodeAddress = async (address) => {
  if (!address) return null;
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}, Israel`
    );
    const data = await response.json();
    
    if (data && data[0]) {
      // וידוא שהערכים הם מספרים ולא מחרוזות
      const lon = parseFloat(data[0].lon);
      const lat = parseFloat(data[0].lat);
      
      // וידוא שהערכים חוקיים
      if (isNaN(lon) || isNaN(lat)) {
        console.error('ערכי קואורדינטות לא תקינים:', data[0]);
        return null;
      }
      
      // החזרה כמערך של מספרים - שים לב: GeoJSON מסדר קודם longitude ואז latitude
      return [lon, lat];
    }
    return null;
  } catch (error) {
    console.error('שגיאה בהמרת כתובת לקואורדינטות:', error);
    return null;
  }
};

// הרשמת משתמש חדש
export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'volunteer', address, phone } = req.body;

    // בדיקה אם המשתמש כבר קיים
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'משתמש עם אימייל זה כבר קיים במערכת' });
    }
    
    // בדיקות שדות חובה
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'כל השדות המסומנים בכוכבית הם שדות חובה' });
    }
    
    // בדיקת תקינות מספר טלפון למתנדב
    if (role === 'volunteer') {
      // וידוא שיש מספר טלפון
      if (!phone) {
        return res.status(400).json({ message: 'מספר טלפון הוא שדה חובה למתנדבים' });
      }
      
      // וידוא שמספר הטלפון תקין
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'מספר הטלפון חייב להכיל 10 ספרות בדיוק' });
      }
    }

    // הצפנת הסיסמה
    const hashedPassword = await bcrypt.hash(password, 12);

    // המרת הכתובת לקואורדינטות אם ניתן
    let location = null;
    if (address) {
      try {
        const coordinates = await geocodeAddress(address);
        console.log('קואורדינטות שהתקבלו:', coordinates);
        
        if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
          location = {
            type: 'Point',
            coordinates: coordinates
          };
          console.log('מיקום שנוצר:', location);
        } else {
          // מיקום ברירת מחדל של ישראל אם לא התקבלו קואורדינטות תקינות
          location = {
            type: 'Point',
            coordinates: [35.217018, 31.771959]
          };
          console.log('מיקום ברירת מחדל נוצר:', location);
        }
      } catch (geoError) {
        console.error('שגיאה בהמרת כתובת למיקום:', geoError);
        // מיקום ברירת מחדל של ישראל במקרה של שגיאה
        location = {
          type: 'Point',
          coordinates: [35.217018, 31.771959]
        };
      }
    } else {
      // מיקום ברירת מחדל של ישראל אם אין כתובת
      location = {
        type: 'Point',
        coordinates: [35.217018, 31.771959]
      };
    }

    // יצירת נתוני משתמש חדש
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      address: address || '',
      isActive: true,
      location // תמיד יהיה מיקום, גם אם ברירת מחדל
    };
    
    let user;
    let token;

    // אם המשתמש הוא מתנדב, נשתמש בפונקציית הקישור
    if (role === 'volunteer') {
      console.log('יוצר משתמש מתנדב מקושר');
      
      // נתוני המתנדב
      const volunteerData = {
        email,
        firstName, 
        lastName,
        phone,
        address: {
          street: address || '',
          city: ''
        },
        location,
        role: 'מתנדב'
      };
      
      try {
        // יצירת משתמש ומתנדב מקושרים
        const result = await createLinkedVolunteer(userData, volunteerData);
        user = result.user;
        console.log('נוצר משתמש מתנדב:', user._id, 'מקושר למתנדב:', result.volunteer._id);
      } catch (linkError) {
        console.error('שגיאה ביצירת מתנדב מקושר:', linkError);
        return res.status(500).json({ 
          message: 'שגיאה בהרשמה', 
          error: linkError.message || 'שגיאה ביצירת משתמש מתנדב מקושר'
        });
      }
    } else {
      // יצירת משתמש רגיל (לא מתנדב)
      try {
        console.log('נתוני משתמש לשמירה:', { ...userData, password: '********' }); // הסתרת הסיסמה בלוג
        user = await User.create(userData);
      } catch (userError) {
        console.error('שגיאה ביצירת משתמש:', userError);
        return res.status(500).json({ 
          message: 'שגיאה בהרשמה', 
          error: userError.message || 'שגיאה ביצירת משתמש חדש'
        });
      }
    }

    // יצירת טוקן
    try {
      token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
    } catch (tokenError) {
      console.error('שגיאה ביצירת טוקן:', tokenError);
      return res.status(500).json({ 
        message: 'הרשמה הצליחה אך נכשלה יצירת טוקן התחברות',
        error: tokenError.message 
      });
    }

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        address: user.address
      }
    });
  } catch (error) {
    console.error('שגיאה מפורטת בהרשמה:', error);
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
    let user = await User.findOne({ email });
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

    // אם המשתמש הוא מתנדב, נביא גם מידע מהמודל של המתנדב
    let volunteerData = null;
    if (user.role === 'volunteer') {
      try {
        const volunteer = await findVolunteerByUserId(user._id);
        if (volunteer) {
          console.log('נמצא מתנדב מקושר:', volunteer._id);
          volunteerData = volunteer;
          
          // עדכון תאריך התחברות אחרונה של המתנדב
          volunteer.lastLogin = new Date();
          await volunteer.save();
        } else {
          console.log('לא נמצא מתנדב מקושר למשתמש:', user._id);
        }
      } catch (volunteerErr) {
        console.error('שגיאה בקבלת מידע המתנדב:', volunteerErr);
      }
    }

    // תיקון מבנה מיקום לא תקין (אם יש) - בנפרד מתהליך האימות
    if (user.location && user.location.coordinates) {
      console.log('בודק תקינות מיקום עבור:', email);
      
      try {
        let needsLocationFix = false;
        const coordinates = user.location.coordinates;
        
        // נסיון לזהות פורמט לא תקין של קואורדינטות
        if (typeof coordinates === 'string' || 
            (Array.isArray(coordinates) && coordinates.length > 0 && typeof coordinates[0] === 'string')) {
          
          needsLocationFix = true;
          console.log('נמצא פורמט קואורדינטות לא תקין:', coordinates);
          
          // נסיון לפרסר מחרוזת כ-JSON
          try {
            const stringValue = Array.isArray(coordinates) ? coordinates[0] : coordinates;
            let parsedValue = null;
            
            try {
              parsedValue = JSON.parse(stringValue);
            } catch (parseErr) {
              console.log('לא ניתן לפרסר את הקואורדינטות כ-JSON');
            }
            
            // בדיקת מבנים אפשריים של הקואורדינטות
            if (parsedValue) {
              if (Array.isArray(parsedValue) && parsedValue.length > 0) {
                // אם המבנה הוא מערך של אובייקטים עם lat ו-lng
                if (parsedValue[0].lat && parsedValue[0].lng) {
                  user.location.coordinates = [parsedValue[0].lng, parsedValue[0].lat];
                  console.log('קואורדינטות תוקנו (מבנה מערך):', user.location.coordinates);
                } 
                // אם המבנה הוא מערך של מספרים
                else if (typeof parsedValue[0] === 'number' && typeof parsedValue[1] === 'number') {
                  user.location.coordinates = [parsedValue[0], parsedValue[1]];
                  console.log('קואורדינטות תוקנו (מערך מספרים):', user.location.coordinates);
                }
              } 
              // אם המבנה הוא אובייקט בודד עם lat ו-lng
              else if (parsedValue.lat && parsedValue.lng) {
                user.location.coordinates = [parsedValue.lng, parsedValue.lat];
                console.log('קואורדינטות תוקנו (אובייקט בודד):', user.location.coordinates);
              }
              else {
                // אם המבנה לא ידוע
                console.log('מבנה קואורדינטות לא ידוע, מסיר את המיקום');
                user.location = undefined;
              }
            } else {
              // אם לא הצלחנו לפרסר, מסירים את המיקום
              console.log('לא ניתן לפרסר את הקואורדינטות, מסיר את המיקום');
              user.location = undefined;
            }
          } catch (fixErr) {
            console.error('שגיאה בניסיון לתקן את הקואורדינטות:', fixErr);
            // במקרה של שגיאה בתיקון, נסיר את המיקום
            user.location = undefined;
          }
        } 
        // בדיקה אם הקואורדינטות הן מספרים תקינים
        else if (Array.isArray(coordinates) && coordinates.length >= 2) {
          const lon = coordinates[0];
          const lat = coordinates[1];
          
          const isValidLongitude = !isNaN(lon) && lon >= -180 && lon <= 180;
          const isValidLatitude = !isNaN(lat) && lat >= -90 && lat <= 90;
          
          if (!isValidLongitude || !isValidLatitude) {
            console.log('קואורדינטות לא תקינות (מספרים לא תקינים):', coordinates);
            user.location = undefined;
            needsLocationFix = true;
          }
        }
        
        // שמירת השינויים אם יש צורך
        if (needsLocationFix) {
          try {
            const updatedUser = await User.findByIdAndUpdate(
              user._id,
              { $set: { location: user.location } },
              { new: true, runValidators: false } // לא להפעיל ולידציה כדי להימנע מבעיות
            );
            
            if (updatedUser) {
              console.log('מיקום משתמש עודכן בהצלחה');
              user = updatedUser;
            } else {
              console.log('לא ניתן היה לעדכן את מיקום המשתמש');
            }
          } catch (updateErr) {
            console.error('שגיאה בעדכון מיקום המשתמש, ממשיך ללא עדכון:', updateErr);
            // נמשיך בתהליך ההתחברות גם אם נכשל העדכון
          }
        }
      } catch (locationErr) {
        console.error('שגיאה בטיפול במיקום המשתמש:', locationErr);
        // נמשיך בתהליך ההתחברות גם אם היתה שגיאה בטיפול במיקום
      }
    }

    // יצירת טוקן
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // שמירת הטוקן במשתמש (בלי לגעת בשדה המיקום)
    try {
      user.tokens = user.tokens || [];
      user.tokens.push(token);
      
      await User.findByIdAndUpdate(
        user._id,
        { $push: { tokens: token } },
        { new: true, runValidators: false }
      );
      
      console.log('טוקן נשמר בהצלחה למשתמש');
    } catch (tokenErr) {
      console.error('שגיאה בשמירת הטוקן למשתמש:', tokenErr);
      // נמשיך בתהליך ההתחברות גם אם נכשלה שמירת הטוקן
    }

    console.log('התחברות מוצלחת:', email);

    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      address: user.address
    };

    // הוספת נתוני המתנדב בתגובה אם קיימים
    if (volunteerData) {
      userResponse.volunteer = {
        id: volunteerData._id,
        status: volunteerData.status || 'available',
        lastLogin: volunteerData.lastLogin
      };
    }

    console.log('שולח תגובה:', { token });

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
      role: user.role,
      address: user.address,
      location: user.location
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

// עדכון פרופיל משתמש
export const updateProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'address', 'location'];
    
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({ message: 'עדכונים לא חוקיים' });
    }

    // אם יש כתובת חדשה, ננסה להמיר אותה לקואורדינטות
    if (req.body.address) {
      try {
        const coordinates = await geocodeAddress(req.body.address);
        if (coordinates) {
          req.body.location = {
            type: 'Point',
            coordinates: coordinates
          };
        }
      } catch (geocodeError) {
        console.error('שגיאה בהמרת כתובת לקואורדינטות:', geocodeError);
        // נמשיך בלי מיקום אם יש שגיאה
      }
    }

    // אם יש מיקום בבקשה, נבדוק שהוא תקין
    if (req.body.location) {
      if (typeof req.body.location === 'string') {
        try {
          req.body.location = JSON.parse(req.body.location);
        } catch (error) {
          return res.status(400).json({ message: 'פורמט מיקום לא תקין' });
        }
      }

      // וידוא שהמיקום במבנה הנכון
      if (!req.body.location.type || !req.body.location.coordinates) {
        req.body.location = undefined;
      } else {
        // בדיקת תקינות הקואורדינטות
        const coordinates = req.body.location.coordinates;
        if (!Array.isArray(coordinates) || coordinates.length !== 2) {
          req.body.location = undefined;
        } else {
          const lon = parseFloat(coordinates[0]);
          const lat = parseFloat(coordinates[1]);
          
          if (isNaN(lon) || lon < -180 || lon > 180 || isNaN(lat) || lat < -90 || lat > 90) {
            req.body.location = undefined;
          }
        }
      }
    }

    // עדכון הפרופיל
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'משתמש לא נמצא' });
    }

    // אם המשתמש הוא מתנדב, עדכן גם את הרשומה במודל המתנדב
    if (user.role === 'volunteer') {
      try {
        // מכין את הנתונים לעדכון המתנדב
        const volunteerUpdateData = {};
        
        if (req.body.firstName) volunteerUpdateData.firstName = req.body.firstName;
        if (req.body.lastName) volunteerUpdateData.lastName = req.body.lastName;
        if (req.body.phone) volunteerUpdateData.phone = req.body.phone;
        
        if (req.body.address) {
          volunteerUpdateData.address = {
            street: req.body.address,
            city: ''
          };
        }
        
        if (req.body.location) {
          volunteerUpdateData.location = req.body.location;
        }
        
        // עדכון המתנדב המקושר
        const updatedVolunteer = await updateVolunteerByUserId(user._id, volunteerUpdateData);
        console.log('עודכן מתנדב מקושר:', updatedVolunteer ? updatedVolunteer._id : 'לא נמצא');
      } catch (volunteerUpdateError) {
        console.error('שגיאה בעדכון המתנדב המקושר:', volunteerUpdateError);
        // נמשיך גם אם יש שגיאה בעדכון המתנדב
      }
    }

    res.json(user);
  } catch (error) {
    console.error('שגיאה בעדכון פרופיל:', error);
    res.status(400).json({ 
      message: 'שגיאה בעדכון פרופיל',
      error: error.message 
    });
  }
}; 