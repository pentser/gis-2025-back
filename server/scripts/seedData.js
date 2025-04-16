import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Volunteer from '../models/volunteer.model.js';
import Elderly from '../models/elderly.model.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('מחובר למסד הנתונים');

    // מחיקת נתונים קיימים
    await Promise.all([
      Volunteer.deleteMany({}),
      Elderly.deleteMany({})
    ]);
    console.log('נתונים קיימים נמחקו');

    // יצירת מתנדבים
    const hashedPassword = await bcrypt.hash('123456', 10);
    const volunteers = [
      {
        firstName: 'דוד',
        lastName: 'כהן',
        email: 'david@example.com',
        password: hashedPassword,
        phone: '0501234567',
        address: {
          street: 'הרצל 1',
          city: 'תל אביב',
          zipCode: '6123001'
        },
        location: {
          type: 'Point',
          coordinates: [34.7818, 32.0853]  // תל אביב
        },
        role: 'מנהל',
        isActive: true
      },
      {
        firstName: 'שרה',
        lastName: 'לוי',
        email: 'sara@example.com',
        password: hashedPassword,
        phone: '0502345678',
        address: {
          street: 'ויצמן 15',
          city: 'רחובות',
          zipCode: '7610001'
        },
        location: {
          type: 'Point',
          coordinates: [34.8114, 31.8928]  // רחובות
        },
        role: 'מתנדב',
        isActive: true
      },
      {
        firstName: 'יוסי',
        lastName: 'אברהם',
        email: 'yossi@example.com',
        password: hashedPassword,
        phone: '0503456789',
        address: {
          street: 'בן גוריון 30',
          city: 'חיפה',
          zipCode: '3498838'
        },
        location: {
          type: 'Point',
          coordinates: [34.9896, 32.7940]  // חיפה
        },
        role: 'מתנדב',
        isActive: true
      }
    ];

    // יצירת קשישים
    const elderly = [
      {
        firstName: 'רחל',
        lastName: 'גולדברג',
        idNumber: '123456789',
        birthDate: new Date('1945-03-15'),
        phone: '0541234567',
        address: {
          street: 'רוטשילד 10',
          city: 'תל אביב',
          zipCode: '6688310'
        },
        location: {
          type: 'Point',
          coordinates: [34.7818, 32.0853]  // תל אביב
        },
        emergencyContact: {
          name: 'משה גולדברג',
          phone: '0507654321',
          relation: 'בן'
        },
        medicalInfo: {
          conditions: ['לחץ דם גבוה', 'סוכרת'],
          medications: ['אספירין', 'מטפורמין'],
          allergies: ['פניצילין'],
          notes: 'זקוקה לעזרה בקניות ובסידורים'
        },
        preferences: {
          visitFrequency: 'שבועי',
          preferredDays: ['ראשון', 'רביעי'],
          preferredTime: 'בוקר'
        },
        status: 'פעיל'
      },
      {
        firstName: 'אברהם',
        lastName: 'שפירא',
        idNumber: '987654321',
        birthDate: new Date('1940-07-22'),
        phone: '0542345678',
        address: {
          street: 'הנביאים 5',
          city: 'ירושלים',
          zipCode: '9514205'
        },
        location: {
          type: 'Point',
          coordinates: [35.2137, 31.7683]  // ירושלים
        },
        emergencyContact: {
          name: 'שרה שפירא',
          phone: '0508765432',
          relation: 'בת'
        },
        medicalInfo: {
          conditions: ['בעיות לב'],
          medications: ['קומדין'],
          allergies: [],
          notes: 'זקוק לליווי לטיפולים רפואיים'
        },
        preferences: {
          visitFrequency: 'יומי',
          preferredDays: ['שני', 'רביעי', 'שישי'],
          preferredTime: 'צהריים'
        },
        status: 'פעיל'
      },
      {
        firstName: 'שושנה',
        lastName: 'פרץ',
        idNumber: '456789123',
        birthDate: new Date('1950-11-30'),
        phone: '0543456789',
        address: {
          street: 'הים 20',
          city: 'חיפה',
          zipCode: '3303520'
        },
        location: {
          type: 'Point',
          coordinates: [34.9896, 32.7940]  // חיפה
        },
        emergencyContact: {
          name: 'יעקב פרץ',
          phone: '0509876543',
          relation: 'אח'
        },
        medicalInfo: {
          conditions: ['אוסטאופורוזיס'],
          medications: ['סידן'],
          allergies: ['לקטוז'],
          notes: 'זקוקה לעזרה בניקיון הבית'
        },
        preferences: {
          visitFrequency: 'שבועי',
          preferredDays: ['שלישי', 'חמישי'],
          preferredTime: 'ערב'
        },
        status: 'פעיל'
      }
    ];

    // הכנסת הנתונים למסד הנתונים
    await Promise.all([
      Volunteer.insertMany(volunteers),
      Elderly.insertMany(elderly)
    ]);

    console.log('נתוני הדמה הוכנסו בהצלחה');
    process.exit(0);
  } catch (error) {
    console.error('שגיאה בהכנסת נתוני הדמה:', error);
    process.exit(1);
  }
};

seedData(); 