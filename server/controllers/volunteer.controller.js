import Volunteer from '../models/volunteer.model.js';

// קבלת כל המתנדבים
export const getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find({})
      .select('-password')
      .sort({ firstName: 1, lastName: 1 });
    
    res.json(volunteers);
  } catch (error) {
    console.error('שגיאה בקבלת רשימת המתנדבים:', error);
    res.status(500).json({ message: 'שגיאה בקבלת רשימת המתנדבים' });
  }
}; 