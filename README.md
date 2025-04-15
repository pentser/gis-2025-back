# GIS-2025 MERN Project

פרויקט מבוסס MERN stack הכולל:

## טכנולוגיות
### Frontend
- React.js
- CSS Modules
- Axios
- React-Leaflet
- Context API

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt
- CORS
- Dotenv

## התקנה והפעלה

1. התקן את כל התלויות:
```bash
# בתיקיית הclient
cd client
npm install

# בתיקיית הserver
cd ../server
npm install
```

2. הגדר קובץ .env בתיקיית server:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

3. הפעל את השרת והקליינט:
```bash
# הפעל את השרת
cd server
npm run dev

# הפעל את הקליינט בטרמינל נפרד
cd client
npm run dev
``` 