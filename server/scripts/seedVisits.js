import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import Volunteer from '../models/volunteer.model.js';
import Elderly from '../models/elderly.model.js';
import Visit from '../models/visit.model.js';

// יצירת נתיב מדויק לקובץ .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env');

// טעינת משתני הסביבה מהקובץ .env
dotenv.config({ path: envPath });

console.log('נתיב לקובץ .env:', envPath);
console.log('מחרוזת חיבור למסד הנתונים:', process.env.MONGODB_URI);

// יצירת נתונים אקראיים
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// פונקציה ליצירת תאריך ביקור לפי קטגוריית דחיפות
const getVisitDateByUrgency = (urgency) => {
  const now = new Date();
  
  switch(urgency) {
    case 'high': // דחיפות גבוהה - ביקור לפני יותר מ-21 יום
      return getRandomDate(new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), 
                           new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000));
      
    case 'medium': // דחיפות בינונית - ביקור לפני 11-21 יום
      return getRandomDate(new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), 
                           new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000));
      
    case 'low': // דחיפות נמוכה - ביקור לפני פחות מ-10 ימים
      return getRandomDate(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), 
                           new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000));
      
    case 'none': // ללא ביקור בכלל
      return null;
      
    default:
      return getRandomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now);
  }
};

// רשימת סיכומי ביקור אפשריים
const visitSummaries = [
  'הזקן במצב טוב. ערכתי שיחה נעימה והבאתי מצרכים בסיסיים מהמכולת.',
  'הזקן התלונן על כאבי גב. וידאתי שלקח את התרופות ועזרתי בסידור הבית.',
  'הזקן במצב רוח מרומם. טיילנו בשכונה והבאתי ספר חדש לקריאה.',
  'הזקן היה זקוק לעזרה בתיאום תור לרופא. הצלחנו לקבוע תור ליום שלישי הבא.',
  'הזקן היה די בודד. בישלנו ארוחה ביחד ושיחקנו משחק קלפים.',
  'הזקן נראה מעט חלש. וידאתי שהוא שותה מספיק ועזרתי בהכנת ארוחות ליומיים הקרובים.',
  'ערכתי ניקיון קל בדירה והזקן מאוד שמח על העזרה. שוחחנו על הנכדים.',
  'עזרתי לזקן לצאת מהבית לגינה הקרובה. היה לו יום טוב והוא נהנה מהאוויר הצח.',
  'הזקן ביקש עזרה בבחירת מתנה לנכד שלו. עזרתי לו לקנות מתנה אונליין.',
  'היה ביקור קצר יחסית. הבאתי תרופות מבית המרקחת וסידרנו אותן לפי ימי השבוע.',
  'הזקן שיתף סיפורים מרתקים מהעבר. תיעדתי חלק מהסיפורים לבקשתו.',
  'הזקן התלונן על בדידות. הבאתי לו ספר חדש ובילינו זמן בשיחה.',
  'שוחחנו על משפחתו של הזקן, הראה לי תמונות ישנות, ונהנינו מזמן איכות.',
  'ערכנו הליכה קצרה בחוץ, הזקן במצב טוב והביע שמחה על הביקור.',
  'הזקן ביקש עזרה במילוי טפסים ובהתכתבות עם הביטוח הלאומי. סייעתי בכתיבת המכתב.',
  'הזקן היה מעט מבולבל היום. וידאתי שהכל תקין בבית והשארתי פתק לבני המשפחה.',
  'הזקן בבריאות טובה, שיחקנו שחמט והוא ניצח אותי פעמיים ברציפות.',
  'ערכנו ביקור קניות בסופר. הזקן היה שמח לצאת מהבית ולבחור בעצמו את המצרכים.',
  'הזקן התלונן על בעיות שינה. העברנו לו מידע על טכניקות הרגעה לפני השינה.',
  'קראנו ביחד עיתון, הזקן מתעניין מאוד בחדשות והיה שמח לשוחח על אירועים אקטואליים.'
];

const seedVisits = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('מחובר למסד הנתונים');

    // מחיקת ביקורים קיימים
    await Visit.deleteMany({});
    console.log('ביקורים קיימים נמחקו');

    // קבלת כל המתנדבים והקשישים
    const volunteers = await Volunteer.find({ role: 'מתנדב', isActive: true });
    const elderly = await Elderly.find({});

    console.log(`נמצאו ${volunteers.length} מתנדבים ו-${elderly.length} קשישים`);

    if (volunteers.length === 0 || elderly.length === 0) {
      console.error('לא נמצאו מספיק נתונים כדי ליצור ביקורים');
      process.exit(1);
    }

    const visits = [];
    
    // חלוקה של הקשישים לרמות דחיפות שונות לפי אחוזים
    const shuffledElderly = [...elderly].sort(() => Math.random() - 0.5);
    const totalCount = shuffledElderly.length;
    
    // 15% קשישים ללא ביקור כלל
    const noVisitCount = Math.round(totalCount * 0.15);
    // 30% קשישים עם דחיפות גבוהה
    const highUrgencyCount = Math.round(totalCount * 0.30);
    // 25% קשישים עם דחיפות בינונית
    const mediumUrgencyCount = Math.round(totalCount * 0.25);
    // 30% קשישים עם דחיפות נמוכה
    const lowUrgencyCount = totalCount - noVisitCount - highUrgencyCount - mediumUrgencyCount;
    
    console.log(`חלוקה לדחיפויות: ללא ביקור: ${noVisitCount}, גבוהה: ${highUrgencyCount}, בינונית: ${mediumUrgencyCount}, נמוכה: ${lowUrgencyCount}`);
    
    // מערך לשמירת המיפוי של הקשישים לרמת דחיפות
    const elderlyUrgencyMapping = {};
    
    // קבוצה 1: קשישים ללא ביקור כלל
    const noVisitElderly = shuffledElderly.slice(0, noVisitCount);
    noVisitElderly.forEach(elder => {
      elderlyUrgencyMapping[elder._id.toString()] = 'none';
    });
    
    // קבוצה 2: קשישים עם דחיפות גבוהה
    const highUrgencyElderly = shuffledElderly.slice(noVisitCount, noVisitCount + highUrgencyCount);
    highUrgencyElderly.forEach(elder => {
      elderlyUrgencyMapping[elder._id.toString()] = 'high';
    });
    
    // קבוצה 3: קשישים עם דחיפות בינונית
    const mediumUrgencyElderly = shuffledElderly.slice(
      noVisitCount + highUrgencyCount, 
      noVisitCount + highUrgencyCount + mediumUrgencyCount
    );
    mediumUrgencyElderly.forEach(elder => {
      elderlyUrgencyMapping[elder._id.toString()] = 'medium';
    });
    
    // קבוצה 4: קשישים עם דחיפות נמוכה
    const lowUrgencyElderly = shuffledElderly.slice(
      noVisitCount + highUrgencyCount + mediumUrgencyCount
    );
    lowUrgencyElderly.forEach(elder => {
      elderlyUrgencyMapping[elder._id.toString()] = 'low';
    });
    
    // יצירת ביקורים לקשישים שיש להם תאריך ביקור
    const eldersWithVisits = shuffledElderly.filter(elder => 
      elderlyUrgencyMapping[elder._id.toString()] !== 'none'
    );
    
    // מעבר על כל הקשישים שמקבלים ביקור ויצירת ביקור בהתאם לרמת הדחיפות שלהם
    for (const elder of eldersWithVisits) {
      // בחירת מתנדב אקראי
      const volunteer = volunteers[Math.floor(Math.random() * volunteers.length)];
      
      // קביעת תאריך הביקור לפי רמת הדחיפות
      const urgency = elderlyUrgencyMapping[elder._id.toString()];
      const lastVisit = getVisitDateByUrgency(urgency);
      
      // בחירת סיכום ביקור אקראי
      const visitSummary = visitSummaries[Math.floor(Math.random() * visitSummaries.length)];
      
      // יצירת ביקור קודם (אם יש)
      let previousVisit = null;
      if (Math.random() > 0.4) { // 60% מהביקורים יהיו עם ביקור קודם
        previousVisit = getRandomDate(
          new Date(lastVisit.getTime() - 60 * 24 * 60 * 60 * 1000), 
          new Date(lastVisit.getTime() - 7 * 24 * 60 * 60 * 1000)
        );
      }
      
      // הוספת הביקור למערך הביקורים
      visits.push({
        elder: elder._id,
        volunteer: volunteer._id,
        lastVisit,
        previousVisit,
        visitSummary
      });
      
      // עדכון הקשיש עם תאריך הביקור האחרון
      await Elderly.findByIdAndUpdate(elder._id, { 
        lastVisit,
        status: Math.random() > 0.2 ? 'פעיל' : 'לא פעיל' // 20% מהקשישים לא פעילים
      });
    }
    
    // עדכון הקשישים ללא ביקור
    for (const elder of noVisitElderly) {
      await Elderly.findByIdAndUpdate(elder._id, { 
        lastVisit: null,
        status: Math.random() > 0.5 ? 'פעיל' : 'לא פעיל' // 50% מהקשישים ללא ביקור אינם פעילים
      });
    }

    // שמירת הביקורים במסד הנתונים
    if (visits.length > 0) {
      await Visit.insertMany(visits);
    }

    console.log(`נוצרו ${visits.length} ביקורים בהצלחה`);
    console.log('התפלגות רמות דחיפות:');
    console.log(`- ללא ביקור: ${noVisitCount} קשישים`);
    console.log(`- דחיפות גבוהה: ${highUrgencyCount} קשישים`);
    console.log(`- דחיפות בינונית: ${mediumUrgencyCount} קשישים`);
    console.log(`- דחיפות נמוכה: ${lowUrgencyCount} קשישים`);
    
    process.exit(0);
  } catch (error) {
    console.error('שגיאה בהכנסת נתוני ביקורים:', error);
    process.exit(1);
  }
};

seedVisits(); 