# GIS-2025 Project

מערכת לניהול ומעקב אחר מיקומים גיאוגרפיים של זקנים ומתנדבים.

## טכנולוגיות

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Maps: Leaflet
- Authentication: JWT

## התקנה והפעלה

### דרישות מקדימות

- Node.js (לפיתוח מקומי)
- MongoDB Atlas account
- חשבון DigitalOcean

### התקנה מקומית

1. שכפל את המאגר:
```bash
git clone https://github.com/your-username/gis-2025.git
cd gis-2025
```

2. הגדר משתני סביבה:
   - צור קובץ `.env` בספריית `server`:
   ```
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
   - צור קובץ `.env` בספריית `client`:
   ```
   VITE_API_URL=http://localhost:5000
   ```

3. התקן תלויות:
```bash
# בספריית server
cd server
npm install

# בספריית client
cd ../client
npm install
```

4. הפעל את האפליקציה:
```bash
# בספריית server
npm run dev

# בספריית client
npm run dev
```

## העלאה ל-DigitalOcean App Platform

1. צור חשבון ב-DigitalOcean

2. התקן את DigitalOcean CLI:
```bash
brew install doctl  # עבור macOS
```

3. התחבר לחשבון DigitalOcean:
```bash
doctl auth init
```

4. העלה את הקוד ל-GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/gis-2025.git
git push -u origin main
```

5. צור אפליקציה חדשה ב-DigitalOcean App Platform:
   - לחץ על "Create App"
   - בחר "GitHub" כמקור הקוד
   - בחר את המאגר שלך
   - בחר את הענף `main`

6. הגדר את השירותים:
   - הגדר את שירות ה-Client:
     - Build Command: `cd client && npm install && npm run build`
     - Run Command: `cd client && npm run preview`
     - HTTP Port: 80
   
   - הגדר את שירות ה-Server:
     - Build Command: `cd server && npm install`
     - Run Command: `cd server && npm start`
     - HTTP Port: 5000

7. הגדר משתני סביבה:
   - MONGODB_URI: כתובת ה-MongoDB Atlas שלך
   - JWT_SECRET: מפתח JWT סודי
   - VITE_API_URL: כתובת ה-API של השרת

8. הגדר את בסיס הנתונים:
   - בחר MongoDB כסוג בסיס הנתונים
   - הגדר את פרטי החיבור

9. לחץ על "Create Resources" והמתן להשלמת התהליך

## תחזוקה

### לוגים
- צפה בלוגים דרך ממשק ה-DigitalOcean App Platform
- או השתמש ב-CLI:
```bash
doctl apps logs <app-id>
```

### עדכון האפליקציה
1. בצע שינויים בקוד
2. דחוף ל-GitHub:
```bash
git add .
git commit -m "Update"
git push
```
3. DigitalOcean יבנה ויעלה אוטומטית את הגרסה החדשה

### גיבוי
- DigitalOcean App Platform מבצע גיבויים אוטומטיים של בסיס הנתונים
- ניתן להגדיר גיבויים נוספים דרך ממשק MongoDB Atlas

## אבטחה

- כל הסיסמאות מוצפנות
- שימוש ב-JWT לאימות
- הגנה מפני התקפות CSRF
- הגנה מפני SQL Injection
- שימוש ב-HTTPS (מוגדר אוטומטית ב-App Platform)

## רישיון

MIT 