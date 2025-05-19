import User from '../models/user.model.js';
import Volunteer from '../models/volunteer.model.js';
import bcrypt from 'bcryptjs';

/**
 * פונקציה ליצירת מתנדב חדש וקישורו למשתמש
 * @param {Object} userData - נתוני המשתמש מהמערכת
 * @param {Object} volunteerData - נתוני המתנדב
 * @returns {Object} - אובייקט המכיל את המשתמש והמתנדב שנוצרו
 */
export const createLinkedVolunteer = async (userData, volunteerData = {}) => {
  try {
    // יצירת משתמש חדש במערכת
    const user = await User.create(userData);
    
    // בדיקה והכנה של מיקום תקין
    let location = volunteerData.location;
    
    // אם יש מיקום, בדוק שהוא תקין
    if (location && location.coordinates) {
      // וידוא שהקואורדינטות הן מערך של שני מספרים תקינים
      if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2 ||
          !Number.isFinite(location.coordinates[0]) || !Number.isFinite(location.coordinates[1]) ||
          location.coordinates[0] < -180 || location.coordinates[0] > 180 ||
          location.coordinates[1] < -90 || location.coordinates[1] > 90) {
        // מיקום לא תקין - ניצור מיקום ברירת מחדל של ישראל
        location = {
          type: 'Point',
          coordinates: [35.217018, 31.771959] // ברירת מחדל למרכז ישראל
        };
      }
    } else if (!location || !location.coordinates) {
      // אין מיקום - ניצור מיקום ברירת מחדל של ישראל
      location = {
        type: 'Point',
        coordinates: [35.217018, 31.771959] // ברירת מחדל למרכז ישראל
      };
    }
    
    // הוספת שדה user למתנדב
    const completeVolunteerData = {
      ...volunteerData,
      user: user._id,
      email: user.email, // הבטחה שהאימייל יהיה זהה
      firstName: volunteerData.firstName || user.firstName,
      lastName: volunteerData.lastName || user.lastName,
      location: location,
      password: userData.password // הסיסמה המוצפנת מועברת כפי שהיא
    };
    
    // יצירת מתנדב חדש וקישורו למשתמש
    const volunteer = await Volunteer.create(completeVolunteerData);
    
    return { user, volunteer };
  } catch (error) {
    console.error('שגיאה ביצירת מתנדב מקושר:', error);
    throw error;
  }
};

/**
 * פונקציה למציאת מתנדב לפי מזהה משתמש
 * @param {String} userId - מזהה המשתמש
 * @returns {Object} - אובייקט המתנדב
 */
export const findVolunteerByUserId = async (userId) => {
  try {
    return await Volunteer.findOne({ user: userId });
  } catch (error) {
    console.error('שגיאה במציאת מתנדב לפי מזהה משתמש:', error);
    throw error;
  }
};

/**
 * פונקציה למציאת משתמש ומתנדב יחד לפי אימייל
 * @param {String} email - אימייל המשתמש
 * @returns {Object} - אובייקט המכיל את המשתמש והמתנדב
 */
export const findUserAndVolunteer = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return null;
    
    const volunteer = await Volunteer.findOne({ user: user._id });
    return { user, volunteer };
  } catch (error) {
    console.error('שגיאה במציאת משתמש ומתנדב:', error);
    throw error;
  }
};

/**
 * פונקציה לעדכון מתנדב לפי מזהה משתמש
 * @param {String} userId - מזהה המשתמש
 * @param {Object} updateData - נתוני העדכון
 * @returns {Object} - המתנדב המעודכן
 */
export const updateVolunteerByUserId = async (userId, updateData) => {
  try {
    return await Volunteer.findOneAndUpdate(
      { user: userId },
      updateData,
      { new: true, runValidators: true }
    );
  } catch (error) {
    console.error('שגיאה בעדכון מתנדב:', error);
    throw error;
  }
}; 