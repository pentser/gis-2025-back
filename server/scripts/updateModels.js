/**
 * סקריפט לעדכון מודלים במסד הנתונים MongoDB
 * 
 * אופן הרצה:
 * node scripts/updateModels.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Volunteer from '../models/volunteer.model.js';
import Elderly from '../models/elderly.model.js';
import Visit from '../models/visit.model.js';

// טעינת משתני סביבה
dotenv.config();

// פונקציה ראשית לעדכון המודלים
async function updateModels() {
  try {
    console.log('מתחיל עדכון מודלים במסד הנתונים...');
    console.log('מנסה להתחבר למסד הנתונים:', process.env.MONGODB_URI);
    
    // התחברות למסד הנתונים
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('התחברות למסד הנתונים הצליחה!');

    // מידע על מספר הרשומות לפני העדכון
    const userCountBefore = await User.countDocuments();
    const volunteerCountBefore = await Volunteer.countDocuments();
    const elderlyCountBefore = await Elderly.countDocuments();
    const visitCountBefore = await Visit.countDocuments();

    console.log('\nמספר רשומות לפני העדכון:');
    console.log(`- משתמשים: ${userCountBefore}`);
    console.log(`- מתנדבים: ${volunteerCountBefore}`);
    console.log(`- קשישים: ${elderlyCountBefore}`);
    console.log(`- ביקורים: ${visitCountBefore}`);

    // עדכון מיקום משתמשים לפורמט GeoJSON תקני
    const usersWithLocation = await User.find({ location: { $exists: true } });
    let fixedLocationCount = 0;

    console.log(`\nמתחיל לבדוק מיקומים של ${usersWithLocation.length} משתמשים...`);
    
    for (const user of usersWithLocation) {
      if (user.location) {
        const oldLocation = { ...user.location };
        let needsUpdate = false;

        // בדיקה שהמיקום תואם לפורמט של GeoJSON
        if (!user.location.type || user.location.type !== 'Point') {
          user.location.type = 'Point';
          needsUpdate = true;
        }

        // בדיקה שהקואורדינטות תקינות
        if (user.location.coordinates) {
          // המרה למספרים אם הם מחרוזות
          if (Array.isArray(user.location.coordinates)) {
            if (user.location.coordinates.length === 2) {
              const newCoords = [
                parseFloat(user.location.coordinates[0]),
                parseFloat(user.location.coordinates[1])
              ];
              
              if (
                !isNaN(newCoords[0]) && 
                !isNaN(newCoords[1]) && 
                newCoords[0] >= -180 && 
                newCoords[0] <= 180 && 
                newCoords[1] >= -90 && 
                newCoords[1] <= 90
              ) {
                // הקואורדינטות תקינות, עדכון רק אם יש שינוי
                if (
                  newCoords[0] !== user.location.coordinates[0] || 
                  newCoords[1] !== user.location.coordinates[1]
                ) {
                  user.location.coordinates = newCoords;
                  needsUpdate = true;
                }
              } else {
                // קואורדינטות לא תקינות, מחיקת המיקום
                user.location = undefined;
                needsUpdate = true;
              }
            } else {
              // מערך עם מספר לא תקין של קואורדינטות
              user.location = undefined;
              needsUpdate = true;
            }
          } else {
            // הקואורדינטות אינן מערך
            user.location = undefined;
            needsUpdate = true;
          }
        } else {
          // אין קואורדינטות
          user.location = undefined;
          needsUpdate = true;
        }

        // עדכון המשתמש אם צריך
        if (needsUpdate) {
          console.log(`מעדכן מיקום משתמש ${user.email}:`);
          console.log(`  לפני: ${JSON.stringify(oldLocation)}`);
          console.log(`  אחרי: ${JSON.stringify(user.location)}`);
          
          await user.save();
          fixedLocationCount++;
        }
      }
    }

    console.log(`\nסיכום עדכון מיקומים:`);
    console.log(`- סה"כ משתמשים שנבדקו: ${usersWithLocation.length}`);
    console.log(`- משתמשים שמיקומם עודכן: ${fixedLocationCount}`);

    // עדכון מידע הקשרים בין מודלים
    let linkedVolunteers = 0;
    let linkedElderly = 0;

    // קישור מתנדבים למשתמשים
    const volunteersWithoutUser = await Volunteer.find({ user: { $exists: false } });
    console.log(`\nנמצאו ${volunteersWithoutUser.length} מתנדבים ללא קישור למשתמש`);
    
    for (const volunteer of volunteersWithoutUser) {
      // חיפוש משתמש לפי אימייל
      const matchingUser = await User.findOne({ 
        email: volunteer.email,
        role: 'volunteer'
      });
      
      if (matchingUser) {
        volunteer.user = matchingUser._id;
        await volunteer.save();
        linkedVolunteers++;
        console.log(`קישור מתנדב ${volunteer.firstName} ${volunteer.lastName} למשתמש ${matchingUser.email}`);
      } else {
        console.log(`לא נמצא משתמש מתאים למתנדב ${volunteer.firstName} ${volunteer.lastName} (${volunteer.email})`);
      }
    }

    // קישור קשישים למשתמשים
    const elderlyWithoutUser = await Elderly.find({ user: { $exists: false } });
    console.log(`\nנמצאו ${elderlyWithoutUser.length} קשישים ללא קישור למשתמש`);
    
    for (const elderly of elderlyWithoutUser) {
      // אם יש אימייל לקשיש, נחפש משתמש מתאים
      if (elderly.email) {
        const matchingUser = await User.findOne({ 
          email: elderly.email,
          role: 'elderly'
        });
        
        if (matchingUser) {
          elderly.user = matchingUser._id;
          await elderly.save();
          linkedElderly++;
          console.log(`קישור קשיש ${elderly.firstName} ${elderly.lastName} למשתמש ${matchingUser.email}`);
        } else {
          console.log(`לא נמצא משתמש מתאים לקשיש ${elderly.firstName} ${elderly.lastName} (${elderly.email})`);
        }
      }
    }

    // מידע על מספר הרשומות אחרי העדכון
    const userCountAfter = await User.countDocuments();
    const volunteerCountAfter = await Volunteer.countDocuments();
    const elderlyCountAfter = await Elderly.countDocuments();
    const visitCountAfter = await Visit.countDocuments();

    console.log('\nמספר רשומות אחרי העדכון:');
    console.log(`- משתמשים: ${userCountAfter}`);
    console.log(`- מתנדבים: ${volunteerCountAfter}`);
    console.log(`- קשישים: ${elderlyCountAfter}`);
    console.log(`- ביקורים: ${visitCountAfter}`);

    console.log('\nסיכום עדכונים:');
    console.log(`- מיקומי משתמשים שתוקנו: ${fixedLocationCount}`);
    console.log(`- מתנדבים שקושרו למשתמשים: ${linkedVolunteers}`);
    console.log(`- קשישים שקושרו למשתמשים: ${linkedElderly}`);

    console.log('\nעדכון המודלים הסתיים בהצלחה!');
  } catch (error) {
    console.error('שגיאה בעדכון המודלים:', error);
  } finally {
    // סגירת החיבור למסד הנתונים
    await mongoose.disconnect();
    console.log('החיבור למסד הנתונים נסגר');
  }
}

// הרצת הפונקציה הראשית
updateModels()
  .then(() => {
    console.log('הסקריפט הסתיים');
    process.exit(0);
  })
  .catch(err => {
    console.error('שגיאה בהרצת הסקריפט:', err);
    process.exit(1);
  }); 