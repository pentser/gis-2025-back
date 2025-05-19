import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import Volunteer from '../models/volunteer.model.js';
import Elderly from '../models/elderly.model.js';

// יצירת נתיב מדויק לקובץ .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env');

// טעינת משתני הסביבה מהקובץ .env
dotenv.config({ path: envPath });

// מידע של ערים בארץ עם קואורדינטות
const cities = [
  { name: 'תל אביב', coordinates: [34.7818, 32.0853] },
  { name: 'ירושלים', coordinates: [35.2137, 31.7683] },
  { name: 'חיפה', coordinates: [34.9896, 32.7940] },
  { name: 'באר שבע', coordinates: [34.7913, 31.2529] },
  { name: 'אשדוד', coordinates: [34.6552, 31.8040] },
  { name: 'אשקלון', coordinates: [34.5715, 31.6689] },
  { name: 'רמת גן', coordinates: [34.8114, 32.0832] },
  { name: 'בני ברק', coordinates: [34.8338, 32.0879] },
  { name: 'בת ים', coordinates: [34.7514, 32.0171] },
  { name: 'נתניה', coordinates: [34.8516, 32.3292] },
  { name: 'חולון', coordinates: [34.7805, 32.0171] },
  { name: 'פתח תקווה', coordinates: [34.8859, 32.0898] },
  { name: 'כפר סבא', coordinates: [34.9128, 32.1649] },
  { name: 'הרצליה', coordinates: [34.8435, 32.1642] },
  { name: 'רעננה', coordinates: [34.8729, 32.1837] },
  { name: 'ראשון לציון', coordinates: [34.7894, 31.9672] },
  { name: 'רחובות', coordinates: [34.8114, 31.8928] },
  { name: 'עפולה', coordinates: [35.2900, 32.6100] },
  { name: 'טבריה', coordinates: [35.5300, 32.7900] },
  { name: 'נצרת', coordinates: [35.3000, 32.7000] },
  { name: 'עכו', coordinates: [35.0700, 32.9300] },
  { name: 'חדרה', coordinates: [34.9100, 32.4400] },
  { name: 'אילת', coordinates: [34.9500, 29.5500] },
  { name: 'נהריה', coordinates: [35.0900, 33.0100] },
  { name: 'קרית שמונה', coordinates: [35.5700, 33.2100] },
  // ערים נוספות מכל רחבי הארץ
  { name: 'אום אל-פחם', coordinates: [35.1530, 32.5185] },
  { name: 'שפרעם', coordinates: [35.1710, 32.8054] },
  { name: 'סכנין', coordinates: [35.3037, 32.8651] },
  { name: 'טמרה', coordinates: [35.1986, 32.8536] },
  { name: 'טייבה', coordinates: [34.9995, 32.2662] },
  { name: 'בית שמש', coordinates: [34.9886, 31.7304] },
  { name: 'דימונה', coordinates: [35.0320, 31.0658] },
  { name: 'ערד', coordinates: [35.2127, 31.2588] },
  { name: 'נתיבות', coordinates: [34.5811, 31.4078] },
  { name: 'אופקים', coordinates: [34.6209, 31.3172] },
  { name: 'מגדל העמק', coordinates: [35.2407, 32.6773] },
  { name: 'בית שאן', coordinates: [35.4970, 32.4971] },
  { name: 'כרמיאל', coordinates: [35.3051, 32.9159] },
  { name: 'טירת כרמל', coordinates: [34.9714, 32.7603] },
  { name: 'יקנעם', coordinates: [35.1086, 32.6593] },
  { name: 'עראבה', coordinates: [35.3386, 32.8512] },
  { name: 'דלית אל-כרמל', coordinates: [35.0421, 32.6938] },
  { name: 'עוספיא', coordinates: [35.0688, 32.7019] },
  { name: 'ירכא', coordinates: [35.1979, 32.9539] },
  { name: 'מעלות-תרשיחא', coordinates: [35.2713, 33.0166] },
  { name: 'שדרות', coordinates: [34.5960, 31.5259] },
  { name: 'מודיעין', coordinates: [35.0146, 31.8969] },
  { name: 'רהט', coordinates: [34.7642, 31.3893] },
  { name: 'קרית גת', coordinates: [34.7703, 31.6100] },
  { name: 'יבנה', coordinates: [34.7384, 31.8782] },
  { name: 'נס ציונה', coordinates: [34.7987, 31.9293] },
  { name: 'גבעתיים', coordinates: [34.8126, 32.0703] },
  { name: 'חצור הגלילית', coordinates: [35.5424, 33.0137] },
  { name: 'קרית ים', coordinates: [35.0688, 32.8334] },
  { name: 'קרית מוצקין', coordinates: [35.0821, 32.8390] },
  // ערים ויישובים נוספים שהוספתי
  { name: 'קרית ביאליק', coordinates: [35.0873, 32.8275] },
  { name: 'קרית אתא', coordinates: [35.1134, 32.8092] },
  { name: 'צפת', coordinates: [35.5018, 32.9646] },
  { name: 'טבעון', coordinates: [35.1307, 32.7223] },
  { name: 'עתלית', coordinates: [34.9403, 32.6909] },
  { name: 'זכרון יעקב', coordinates: [34.9547, 32.5734] },
  { name: 'פרדס חנה-כרכור', coordinates: [34.9774, 32.4773] },
  { name: 'אור עקיבא', coordinates: [34.9158, 32.5066] },
  { name: 'בנימינה', coordinates: [34.9494, 32.5145] },
  { name: 'גדרה', coordinates: [34.7792, 31.8135] },
  { name: 'קריית מלאכי', coordinates: [34.7477, 31.7273] },
  { name: 'אור יהודה', coordinates: [34.8577, 32.0294] },
  { name: 'יהוד', coordinates: [34.8902, 32.0335] },
  { name: 'אלעד', coordinates: [34.9513, 32.0520] },
  { name: 'טירה', coordinates: [34.9502, 32.2342] },
  { name: 'כפר קאסם', coordinates: [34.9762, 32.1141] },
  { name: 'ראש העין', coordinates: [34.9528, 32.0958] },
  { name: 'שוהם', coordinates: [34.9456, 31.9987] },
  { name: 'מזכרת בתיה', coordinates: [34.8169, 31.8546] },
  { name: 'מיתר', coordinates: [34.9332, 31.3234] },
  { name: 'להבים', coordinates: [34.8162, 31.3728] },
  { name: 'עומר', coordinates: [34.8498, 31.2652] },
  { name: 'ירוחם', coordinates: [34.9304, 30.9884] },
  { name: 'מצפה רמון', coordinates: [34.7982, 30.6102] }
];

// מיפוי אותיות עבריות לאנגליות לצורך כתובת מייל
const mapHebrewToEnglish = (name) => {
  const map = {
    'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
    'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ל': 'l', 'מ': 'm', 'נ': 'n',
    'ס': 's', 'ע': 'a', 'פ': 'p', 'צ': 'ts', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't'
  };
  
  return name.split('').map(char => map[char] || char).join('');
};

// יצירת נתונים אקראיים
const getRandomCity = () => cities[Math.floor(Math.random() * cities.length)];
const getRandomStreet = () => {
  const streets = ['הרצל', 'בן גוריון', 'ויצמן', 'הנשיא', 'רוטשילד', 'אלנבי', 'דרך השלום', 'הים', 'יפו', 'קק"ל', 'אבן גבירול', 'הנביאים', 'הרב קוק', 'ז\'בוטינסקי', 'מוריה', 'ביאליק', 'טשרניחובסקי', 'שדרות רוקח', 'דרך בגין', 'דיזנגוף'];
  return `${streets[Math.floor(Math.random() * streets.length)]} ${Math.floor(Math.random() * 100) + 1}`;
};
const getRandomPhone = () => `05${Math.floor(Math.random() * 10)}${Math.floor(1000000 + Math.random() * 9000000)}`;
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const getRandomStatus = () => Math.random() > 0.5 ? 'available' : 'busy';

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
    
    // יצירת 150 מתנדבים (במקום 100)
    const volunteers = [];
    
    // מתנדבי ברירת מחדל (מנהלים)
    volunteers.push({
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
      role: 'admin',
      isActive: true,
      lastActive: new Date()
    });
    
    volunteers.push({
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
      role: 'admin',
      isActive: true,
      lastActive: new Date()
    });
    
    // הוספת מנהל נוסף בצפון הארץ
    volunteers.push({
      firstName: 'יעקב',
      lastName: 'ישראלי',
      email: 'yaakov@example.com',
        password: hashedPassword,
        phone: '0503456789',
        address: {
        street: 'הנשיא 5',
          city: 'חיפה',
        zipCode: '3106301'
      },
      location: {
        type: 'Point',
        coordinates: [34.9896, 32.7940]  // חיפה
      },
      role: 'admin',
      isActive: true,
      lastActive: new Date()
    });
    
    // הוספת מנהל נוסף בדרום הארץ
    volunteers.push({
        firstName: 'רחל',
      lastName: 'אברהם',
      email: 'rachel@example.com',
      password: hashedPassword,
      phone: '0504567890',
        address: {
        street: 'דרך הנגב 10',
        city: 'באר שבע',
        zipCode: '8489310'
      },
          location: {
            type: 'Point',
        coordinates: [34.7913, 31.2529]  // באר שבע
      },
      role: 'admin',
      isActive: true,
      lastActive: new Date()
    });
    
    // הוספת מנהל נוסף בירושלים
    volunteers.push({
      firstName: 'משה',
      lastName: 'ברקוביץ',
      email: 'moshe@example.com',
      password: hashedPassword,
      phone: '0505678901',
        address: {
        street: 'יפו 20',
          city: 'ירושלים',
        zipCode: '9422108'
      },
          location: {
            type: 'Point',
            coordinates: [35.2137, 31.7683]  // ירושלים
      },
      role: 'admin',
      isActive: true,
      lastActive: new Date()
    });
    
    // יצירת שאר המתנדבים בפריסה ארצית
    const volunteerFirstNames = ['יוסי', 'רונית', 'משה', 'מיכל', 'אורי', 'רחל', 'דני', 'דנה', 'איתן', 'עדי', 'יעל', 'אבי', 'חיים', 'שירה', 'יהודה', 'תמר', 'נועם', 'שירלי', 'אסף', 'אורלי', 'גיא', 'עמית', 'קרן', 'אלון', 'יפעת', 
    'איריס', 'שמואל', 'הדר', 'מאיר', 'לימור', 'שגיא', 'רוני', 'אלה', 'נדב', 'אילנה', 'ליאור', 'אביב', 'מורן', 'אופיר', 'גלית', 'נעמה', 'דרור', 'טליה', 'אלעד', 'הילה', 'זיו', 'רותם', 'שלומי', 'ענת', 'יניב', 'דפנה', 'עידן', 'סיגל'];
    
    const volunteerLastNames = ['לוי', 'כהן', 'דוד', 'פרץ', 'אברהם', 'מזרחי', 'אזולאי', 'ישראלי', 'שלום', 'רוזנברג', 'גבאי', 'ביטון', 'אוחנה', 'דהן', 'אדרי', 'חדד', 'אביטל', 'לביא', 'גולדשטיין', 'שמעוני', 'ברקוביץ', 'קליין', 'נחמיאס', 'רובין', 'זילברמן',
    'פרידמן', 'שפירא', 'אלוני', 'גור', 'ברנע', 'ששון', 'אורן', 'צור', 'נחום', 'סגל', 'ברוך', 'גלעד', 'עוז', 'נוי', 'קדמי', 'שרעבי', 'דיין', 'בר', 'יונה', 'קידר', 'יובל', 'זהבי', 'תמיר', 'נבון', 'עמר'];
    
    // שמות באנגלית לכתובות מייל
    const englishFirstNames = ['moshe', 'david', 'sarah', 'yossi', 'rachel', 'daniel', 'dana', 'eitan', 'adi', 'yael', 'avi', 'haim', 'shira', 'noam', 'tamar', 'assaf', 'orly', 'guy', 'amit', 'keren', 'alon', 'yifat', 'iris', 'shmuel', 'hadar', 'meir', 'limor', 'sagi', 'roni', 'ella', 'nadav', 'ilana', 'lior', 'aviv', 'moran', 'ofir', 'galit', 'naama', 'dror', 'talia', 'elad', 'hila', 'ziv', 'rotem', 'shlomi', 'anat', 'yaniv', 'dafna', 'idan', 'sigal'];
    
    const englishLastNames = ['levi', 'cohen', 'david', 'peretz', 'abraham', 'mizrahi', 'azoulay', 'israeli', 'shalom', 'rosenberg', 'gabay', 'biton', 'ohana', 'dahan', 'adari', 'hadad', 'avital', 'lavi', 'goldstein', 'simoni', 'berkovich', 'klein', 'nahmias', 'rubin', 'zilberman', 'friedman', 'shapira', 'aloni', 'gur', 'barnea', 'sasson', 'oren', 'zur', 'nahum', 'segal', 'baruch', 'gilad', 'oz', 'noy', 'kadmi', 'sharabi', 'dayan', 'bar', 'yona', 'kedar', 'yuval', 'zahavi', 'tamir', 'navon', 'amar'];
    
    // נתוני רחובות נוספים
    const streets = ['הרצל', 'בן גוריון', 'ויצמן', 'הנשיא', 'רוטשילד', 'אלנבי', 'דרך השלום', 'הים', 'יפו', 'קק"ל', 'אבן גבירול', 'הנביאים', 'הרב קוק', 'ז\'בוטינסקי', 'מוריה', 'ביאליק', 'טשרניחובסקי', 'שדרות רוקח', 'דרך בגין', 'דיזנגוף',
    'סוקולוב', 'שלום עליכם', 'הגפן', 'התאנה', 'הפרחים', 'הדקל', 'החרוב', 'הברוש', 'האלון', 'לח"י', 'הפלמ"ח', 'יהודה הלוי', 'הגלבוע', 'הכרמל', 'הנגב', 'הגליל', 'יד לבנים', 'אחד העם', 'הנרקיס', 'היסמין', 'החבצלת', 'האירוסים', 'השקד', 'התפוז', 'הרימון'];
    
    for (let i = 0; i < 145; i++) {
      const city = getRandomCity();
      const firstName = volunteerFirstNames[Math.floor(Math.random() * volunteerFirstNames.length)];
      const lastName = volunteerLastNames[Math.floor(Math.random() * volunteerLastNames.length)];
      
      // הוספת וריאציה קטנה לקואורדינטות כדי שלא יהיו כולם באותה נקודה
      const randomOffset = () => (Math.random() - 0.5) * 0.02;
      const coordinates = [
        city.coordinates[0] + randomOffset(),
        city.coordinates[1] + randomOffset()
      ];
      
      // יצירת כתובת אימייל באנגלית
      const engFirstName = englishFirstNames[Math.floor(Math.random() * englishFirstNames.length)];
      const engLastName = englishLastNames[Math.floor(Math.random() * englishLastNames.length)];
      const email = `${engFirstName}.${engLastName}${i}@example.com`;
      
      const isActive = Math.random() > 0.1; // 90% מהמתנדבים פעילים
      const status = isActive ? (Math.random() > 0.3 ? 'available' : 'busy') : 'unavailable';
      
      volunteers.push({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone: getRandomPhone(),
        address: {
          street: `${streets[Math.floor(Math.random() * streets.length)]} ${Math.floor(Math.random() * 100) + 1}`,
          city: city.name,
          zipCode: `${Math.floor(10000 + Math.random() * 90000)}`
        },
        location: {
          type: 'Point',
          coordinates
        },
        role: 'volunteer',
        isActive,
        status,
        lastActive: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
      });
    }

    // יצירת 300 זקנים (במקום 200)
    const elderly = [];
    
    // יצירת קשישים בפריסה ארצית
    const elderlyFirstNames = ['אסתר', 'אברהם', 'שרה', 'יעקב', 'רחל', 'יצחק', 'דבורה', 'שמעון', 'חנה', 'משה', 'לאה', 'יוסף', 'רבקה', 'דוד', 'מרים', 'שלמה', 'ציפורה', 'אהרון', 'פנינה', 'יהודה', 'רות', 'מנחם', 'שושנה', 'אליהו', 'טובה', 'שמואל', 'צפורה', 'יהושע', 'בתיה', 'ישראל',
    'גולדה', 'חיים', 'זהבה', 'אריה', 'פרידה', 'יונה', 'נחום', 'בלה', 'זאב', 'עדינה', 'אליעזר', 'גיטל', 'שלום', 'ברכה', 'יחזקאל', 'פייגה', 'נפתלי', 'סימה', 'בן ציון', 'גניה', 'משולם', 'שרית', 'צבי', 'רינה', 'מרדכי', 'שולמית', 'אפרים', 'חווה', 'שמעיה', 'ברוריה'];
    
    const elderlyLastNames = ['לוי', 'כהן', 'פרידמן', 'רוזנברג', 'גולדשטיין', 'שפירא', 'ברקוביץ', 'הירש', 'קליין', 'פרץ', 'ברנשטיין', 'קצנלנבוגן', 'רבינוביץ', 'פוקס', 'גרינברג', 'זילברשטיין', 'אדלר', 'הורוביץ', 'גוטמן', 'מנדלבאום', 'זיו', 'פישמן', 'וינר', 'אייזנברג', 'שטרן',
    'בלומנטל', 'זילברמן', 'ליבוביץ', 'מילר', 'אברמוביץ', 'פינקלשטיין', 'קוגן', 'רוטנברג', 'אלברט', 'גוטליב', 'הלפרין', 'וייס', 'לנדאו', 'רוזנטל', 'שוורץ', 'ברגמן', 'פרידלנדר', 'ליפשיץ', 'הרמן', 'שטיינברג', 'ברגר', 'גולדברג', 'הלברשטם', 'רוזנפלד', 'גליק'];
    
    const healthConditions = ['לחץ דם גבוה', 'סוכרת', 'אוסטאופורוזיס', 'בעיות לב', 'מחלת ריאות', 'אלצהיימר', 'פרקינסון', 'דמנציה', 'אירוע מוחי', 'סרטן', 'שבץ', 'ירוד', 'אסתמה', 'דלקת מפרקים', 'בעיות שמיעה', 'בעיות ראייה', 'בעיות ניידות',
    'יתר לחץ דם', 'תת פעילות בלוטת התריס', 'חרדה', 'דיכאון', 'בעיות עיכול', 'מחלת כבד', 'אי ספיקת כליות', 'בעיות שינה', 'אנמיה', 'דלקת פרקים שגרונית', 'אוסטיאוארטריטיס', 'בעיות זיכרון', 'יתר כולסטרול', 'הפרעת קצב לב', 'אפילפסיה', 'גלאוקומה'];
    
    const medications = ['קומדין', 'אספירין', 'מטפורמין', 'סימבסטטין', 'רמיפריל', 'אומפרדקס', 'לבותירוקסין', 'דילטיאזם', 'דונפזיל', 'פרגבלין', 'גבפנטין', 'סרטרלין', 'אטורבסטטין', 'לוסרטן',
    'אנלפריל', 'פומיד', 'אלטרוקסין', 'אומניק', 'נורמיטן', 'אמלודיפין', 'פרוטונקס', 'נורופן', 'פרדניזון', 'מיקרופירין', 'לוסטרל', 'קסרלטו', 'קונקור', 'נרוסינג', 'אלדקטון', 'פריזמה', 'מיקרדיס', 'פרמין', 'גליקלזיד', 'כולבם', 'טמסולוסין', 'בטסרון', 'דיאזפם', 'זולפידם', 'וולטרן', 'אופטלגין'];
    
    const allergies = ['פניצילין', 'גלוטן', 'לקטוז', 'אגוזים', 'סויה', 'ביצים', 'אספירין', 'איבופרופן', 'סולפה', 'אבק', 'חיות מחמד', 'אבקת פרחים'];
    const preferredDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const preferredTimes = ['בוקר', 'צהריים', 'ערב'];
    const contactRelations = ['בן', 'בת', 'אח', 'אחות', 'נכד', 'נכדה', 'בן דוד', 'בת דודה', 'אחיין', 'אחיינית', 'שכן', 'שכנה', 'חבר', 'חברה'];
    
    const getRandomIdNumber = () => {
      let id = '';
      for (let i = 0; i < 9; i++) id += Math.floor(Math.random() * 10);
      return id;
    };
    
    const getRandomBirthDate = () => getRandomDate(new Date(1930, 0, 1), new Date(1960, 0, 1));
    
    const getRandomArrayItems = (arr, max = 3) => {
      const count = Math.floor(Math.random() * max) + 1;
      const result = [];
      for (let i = 0; i < count; i++) {
        const item = arr[Math.floor(Math.random() * arr.length)];
        if (!result.includes(item)) result.push(item);
      }
      return result;
    };
    
    // קביעת ביקורים אחרונים: חלק בדחיפות גבוהה, חלק בינונית וחלק נמוכה
    const getLastVisit = () => {
      // בחלק מהמקרים, אין ביקור כלל
      if (Math.random() < 0.1) {
        return null; // אין ביקור אחרון
      }
      
      const randomFactor = Math.random();
      let date;
      
      if (randomFactor < 0.4) { // 40% דחיפות גבוהה
        // דחיפות גבוהה: לפני יותר מ-21 יום
        date = getRandomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date(Date.now() - 21 * 24 * 60 * 60 * 1000));
      } else if (randomFactor < 0.7) { // 30% דחיפות בינונית
        // דחיפות בינונית: בין 10-21 יום
        date = getRandomDate(new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), new Date(Date.now() - 10 * 24 * 60 * 60 * 1000));
      } else { // 30% דחיפות נמוכה
        // דחיפות נמוכה: בתוך 10 ימים אחרונים
        date = getRandomDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), new Date());
      }
      
      console.log(`סוג תאריך: ${typeof date}, תאריך: ${date}, ISO: ${date.toISOString()}`);
      return date;
    };
    
    // קביעת סטטוס הקשיש לפי תאריך הביקור האחרון
    const getElderlyStatus = (lastVisit) => {
      // כל הקשישים פעילים, אבל נשתמש בשדה ה-lastVisit כדי לקבוע דחיפות
      return 'פעיל';
    };
    
    // יצירת 200 קשישים בפריסה ארצית
    for (let i = 0; i < 200; i++) {
      const city = getRandomCity();
      const firstName = elderlyFirstNames[Math.floor(Math.random() * elderlyFirstNames.length)];
      const lastName = elderlyLastNames[Math.floor(Math.random() * elderlyLastNames.length)];
      
      // הוספת וריאציה קטנה לקואורדינטות
      const randomOffset = () => (Math.random() - 0.5) * 0.02;
      const coordinates = [
        city.coordinates[0] + randomOffset(),
        city.coordinates[1] + randomOffset()
      ];
      
      const emergencyContactFirstName = elderlyFirstNames[Math.floor(Math.random() * elderlyFirstNames.length)];
      const emergencyContactLastName = lastName; // לרוב קרוב משפחה עם אותו שם משפחה
      
      elderly.push({
        firstName,
        lastName,
        idNumber: getRandomIdNumber(),
        birthDate: getRandomBirthDate(),
        phone: getRandomPhone(),
        address: {
          street: getRandomStreet(),
          city: city.name,
          zipCode: '1234567'
        },
          location: {
            type: 'Point',
          coordinates
        },
        emergencyContact: {
          name: `${emergencyContactFirstName} ${emergencyContactLastName}`,
          phone: getRandomPhone(),
          relation: contactRelations[Math.floor(Math.random() * contactRelations.length)]
        },
        medicalInfo: {
          conditions: getRandomArrayItems(healthConditions, 4),
          medications: getRandomArrayItems(medications, 4),
          allergies: getRandomArrayItems(allergies, 2),
          notes: 'זקוק/ה לעזרה ביומיום'
        },
        preferences: {
          visitFrequency: ['יומי', 'שבועי', 'חודשי'][Math.floor(Math.random() * 3)],
          preferredDays: getRandomArrayItems(preferredDays, 4),
          preferredTime: preferredTimes[Math.floor(Math.random() * preferredTimes.length)]
        },
        status: getElderlyStatus(getLastVisit()),
        lastVisit: getLastVisit()
      });
    }

    // הכנסת הנתונים למסד הנתונים
    await Promise.all([
      Volunteer.insertMany(volunteers),
      Elderly.insertMany(elderly)
    ]);

    console.log('נתוני הדמה הוכנסו בהצלחה:');
    console.log(`- ${volunteers.length} מתנדבים נוספו`);
    console.log(`- ${elderly.length} קשישים נוספו`);
    
    // הדפסת נתוני קשיש לדוגמה
    console.log('=== דוגמה לנתוני קשיש ===');
    console.log(JSON.stringify(elderly[0], null, 2));
    console.log('=== סוף דוגמה ===');
    
    process.exit(0);
  } catch (error) {
    console.error('שגיאה בהכנסת נתוני הדמה:', error);
    process.exit(1);
  }
};

seedData(); 