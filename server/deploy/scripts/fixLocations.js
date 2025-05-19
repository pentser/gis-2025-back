import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

// פונקציה להפיכת קואורדינטות לפורמט תקין
const fixCoordinates = (coordinates) => {
  console.log('מנסה לתקן קואורדינטות:', coordinates);
  
  // מקרה 1: המיקום הוא מערך של מספרים תקינים
  if (Array.isArray(coordinates) && coordinates.length === 2 &&
      typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
    
    // בדיקת תקינות הערכים המספריים
    const lon = coordinates[0];
    const lat = coordinates[1];
    
    if (!isNaN(lon) && lon >= -180 && lon <= 180 &&
        !isNaN(lat) && lat >= -90 && lat <= 90) {
      console.log('הקואורדינטות תקינות, אין צורך בתיקון');
      return { coordinates, valid: true };
    } else {
      console.log('ערכי הקואורדינטות מחוץ לטווח התקין');
      return { coordinates: null, valid: false };
    }
  }
  
  // מקרה 2: המיקום הוא מחרוזת או מערך עם מחרוזת
  let stringValue = null;
  
  if (typeof coordinates === 'string') {
    stringValue = coordinates;
  } else if (Array.isArray(coordinates) && coordinates.length > 0 && typeof coordinates[0] === 'string') {
    stringValue = coordinates[0];
  }
  
  if (stringValue) {
    console.log('נמצאה מחרוזת במקום מספרים:', stringValue);
    
    try {
      // ניסיון לפרסר את המחרוזת כ-JSON
      let parsedValue = null;
      try {
        parsedValue = JSON.parse(stringValue);
      } catch (parseErr) {
        // ניסיון לנקות את המחרוזת ולפרסר שוב
        const cleanedString = stringValue.replace(/'/g, '"').trim();
        try {
          parsedValue = JSON.parse(cleanedString);
        } catch (secondErr) {
          console.log('לא ניתן לפרסר את המחרוזת כ-JSON:', secondErr.message);
        }
      }
      
      if (!parsedValue) {
        // ניסיון לחלץ מספרים מהמחרוזת בדרכים אחרות
        const numberRegex = /-?\d+(\.\d+)?/g;
        const numbers = stringValue.match(numberRegex);
        
        if (numbers && numbers.length >= 2) {
          const lon = parseFloat(numbers[0]);
          const lat = parseFloat(numbers[1]);
          
          if (!isNaN(lon) && lon >= -180 && lon <= 180 &&
              !isNaN(lat) && lat >= -90 && lat <= 90) {
            console.log('חולצו קואורדינטות מספריות מהמחרוזת:', [lon, lat]);
            return { coordinates: [lon, lat], valid: true };
          }
        }
        
        console.log('לא ניתן לחלץ קואורדינטות תקינות מהמחרוזת');
        return { coordinates: null, valid: false };
      }
      
      // בדיקת מבנים אפשריים של הערך המפורסר
      
      // מקרה 1: מערך של אובייקטים עם lat ו-lng
      if (Array.isArray(parsedValue) && parsedValue.length > 0 && 
          parsedValue[0] && typeof parsedValue[0] === 'object') {
        
        if (parsedValue[0].lat !== undefined && parsedValue[0].lng !== undefined) {
          const lon = parseFloat(parsedValue[0].lng);
          const lat = parseFloat(parsedValue[0].lat);
          
          if (!isNaN(lon) && lon >= -180 && lon <= 180 &&
              !isNaN(lat) && lat >= -90 && lat <= 90) {
            console.log('מערך של אובייקטים תוקן ל:', [lon, lat]);
            return { coordinates: [lon, lat], valid: true };
          }
        }
      }
      
      // מקרה 2: אובייקט בודד עם lat ו-lng
      if (!Array.isArray(parsedValue) && parsedValue && 
          parsedValue.lat !== undefined && parsedValue.lng !== undefined) {
        
        const lon = parseFloat(parsedValue.lng);
        const lat = parseFloat(parsedValue.lat);
        
        if (!isNaN(lon) && lon >= -180 && lon <= 180 &&
            !isNaN(lat) && lat >= -90 && lat <= 90) {
          console.log('אובייקט בודד תוקן ל:', [lon, lat]);
          return { coordinates: [lon, lat], valid: true };
        }
      }
      
      // מקרה 3: מערך של מספרים
      if (Array.isArray(parsedValue) && parsedValue.length >= 2) {
        const lon = parseFloat(parsedValue[0]);
        const lat = parseFloat(parsedValue[1]);
        
        if (!isNaN(lon) && lon >= -180 && lon <= 180 &&
            !isNaN(lat) && lat >= -90 && lat <= 90) {
          console.log('מערך של מספרים תוקן ל:', [lon, lat]);
          return { coordinates: [lon, lat], valid: true };
        }
      }
      
      console.log('לא ניתן לחלץ קואורדינטות תקינות מהערך המפורסר');
      return { coordinates: null, valid: false };
      
    } catch (error) {
      console.error('שגיאה כללית בפרסור הקואורדינטות:', error);
      return { coordinates: null, valid: false };
    }
  }
  
  console.log('פורמט קואורדינטות לא מוכר');
  return { coordinates: null, valid: false };
};

// פונקציה לתיקון מבנה הקואורדינטות
async function fixUserLocations() {
  try {
    // התחברות למסד הנתונים
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('מחובר למסד הנתונים MongoDB');

    // מצא את כל המשתמשים
    const users = await User.find({});
    console.log(`נמצאו ${users.length} משתמשים`);

    let fixedCount = 0;
    let errorCount = 0;
    let removedCount = 0;
    let unchangedCount = 0;

    // עבור על כל המשתמשים
    for (const user of users) {
      try {
        console.log(`\n----- בודק משתמש: ${user.email} -----`);
        
        // בדיקה אם יש שדה מיקום
        if (!user.location) {
          console.log('אין שדה מיקום למשתמש זה');
          unchangedCount++;
          continue;
        }
        
        // בדיקה אם השדה location הוא מחרוזת
        if (typeof user.location === 'string') {
          console.log('שדה location הוא מחרוזת, מנסה לתקן');
          try {
            const parsedLocation = JSON.parse(user.location);
            if (parsedLocation && parsedLocation.type === 'Point' && parsedLocation.coordinates) {
              const { coordinates, valid } = fixCoordinates(parsedLocation.coordinates);
              
              if (valid) {
                user.location = {
                  type: 'Point',
                  coordinates: coordinates
                };
                await user.save();
                fixedCount++;
                console.log('מיקום תוקן בהצלחה (מחרוזת location)');
              } else {
                user.location = undefined;
                await user.save();
                removedCount++;
                console.log('מיקום לא תקין הוסר (מחרוזת location)');
              }
            } else {
              user.location = undefined;
              await user.save();
              removedCount++;
              console.log('מיקום לא תקין הוסר (מחרוזת location ללא מבנה נכון)');
            }
          } catch (parseErr) {
            console.error('שגיאה בפרסור מחרוזת location:', parseErr);
            user.location = undefined;
            await user.save();
            removedCount++;
            console.log('מיקום לא תקין הוסר (מחרוזת location לא ניתנת לפרסור)');
          }
          continue;
        }
        
        // בדיקה אם חסרות קואורדינטות
        if (!user.location.coordinates || 
            (Array.isArray(user.location.coordinates) && user.location.coordinates.length === 0)) {
          console.log('אין קואורדינטות במיקום');
          user.location = undefined;
          await user.save();
          removedCount++;
          console.log('מיקום ללא קואורדינטות הוסר');
          continue;
        }
        
        // תיקון הקואורדינטות
        console.log('קואורדינטות קיימות:', user.location.coordinates);
        const { coordinates, valid } = fixCoordinates(user.location.coordinates);
        
        if (valid) {
          // בדיקה אם יש שינוי מהערך הקיים
          if (JSON.stringify(user.location.coordinates) !== JSON.stringify(coordinates)) {
            user.location.coordinates = coordinates;
            await user.save();
            fixedCount++;
            console.log('מיקום תוקן בהצלחה');
          } else {
            unchangedCount++;
            console.log('מיקום תקין, לא נדרש שינוי');
          }
        } else {
          user.location = undefined;
          await user.save();
          removedCount++;
          console.log('מיקום לא תקין הוסר');
        }
        
      } catch (userError) {
        console.error(`שגיאה בטיפול במשתמש ${user.email}:`, userError);
        errorCount++;
      }
    }

    console.log(`\n===== סיכום =====`);
    console.log(`סה"כ משתמשים: ${users.length}`);
    console.log(`תוקנו: ${fixedCount}`);
    console.log(`הוסרו: ${removedCount}`);
    console.log(`ללא שינוי: ${unchangedCount}`);
    console.log(`נכשלו: ${errorCount}`);
  } catch (error) {
    console.error('שגיאה כללית:', error);
  } finally {
    // ניתוק ממסד הנתונים
    await mongoose.disconnect();
    console.log('מנותק ממסד הנתונים');
  }
}

// הפעלת הסקריפט
fixUserLocations(); 