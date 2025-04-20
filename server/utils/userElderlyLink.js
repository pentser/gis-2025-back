import User from '../models/user.model.js';
import Elderly from '../models/elderly.model.js';

/**
 * פונקציה ליצירת קשיש חדש וקישורו למשתמש
 * @param {Object} userData - נתוני המשתמש מהמערכת
 * @param {Object} elderlyData - נתוני הקשיש
 * @returns {Object} - אובייקט המכיל את המשתמש והקשיש שנוצרו
 */
export const createLinkedElderly = async (userData, elderlyData = {}) => {
  try {
    // יצירת משתמש חדש במערכת
    const user = await User.create({
      ...userData,
      role: 'elderly' // וידוא שהתפקיד מוגדר כקשיש
    });
    
    // הוספת שדה user לקשיש
    const completeElderlyData = {
      ...elderlyData,
      user: user._id,
      firstName: elderlyData.firstName || user.firstName,
      lastName: elderlyData.lastName || user.lastName
    };
    
    // יצירת קשיש חדש וקישורו למשתמש
    const elderly = await Elderly.create(completeElderlyData);
    
    return { user, elderly };
  } catch (error) {
    console.error('שגיאה ביצירת קשיש מקושר:', error);
    throw error;
  }
};

/**
 * פונקציה למציאת קשיש לפי מזהה משתמש
 * @param {String} userId - מזהה המשתמש
 * @returns {Object} - אובייקט הקשיש
 */
export const findElderlyByUserId = async (userId) => {
  try {
    return await Elderly.findOne({ user: userId });
  } catch (error) {
    console.error('שגיאה במציאת קשיש לפי מזהה משתמש:', error);
    throw error;
  }
};

/**
 * פונקציה למציאת משתמש וקשיש יחד לפי אימייל
 * @param {String} email - אימייל המשתמש
 * @returns {Object} - אובייקט המכיל את המשתמש והקשיש
 */
export const findUserAndElderly = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return null;
    
    const elderly = await Elderly.findOne({ user: user._id });
    return { user, elderly };
  } catch (error) {
    console.error('שגיאה במציאת משתמש וקשיש:', error);
    throw error;
  }
};

/**
 * פונקציה לעדכון קשיש לפי מזהה משתמש
 * @param {String} userId - מזהה המשתמש
 * @param {Object} updateData - נתוני העדכון
 * @returns {Object} - הקשיש המעודכן
 */
export const updateElderlyByUserId = async (userId, updateData) => {
  try {
    return await Elderly.findOneAndUpdate(
      { user: userId },
      updateData,
      { new: true, runValidators: true }
    );
  } catch (error) {
    console.error('שגיאה בעדכון קשיש:', error);
    throw error;
  }
}; 