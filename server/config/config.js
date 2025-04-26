import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gis-2025',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiration: '24h',
  // הגדרות נוספות למערכת
  geo: {
    defaultCenter: {
      lat: 31.7683,  // ברירת מחדל - ירושלים
      lng: 35.2137
    },
    defaultZoom: 13
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 50
  },
  // הגדרות אבטחה
  security: {
    bcryptSaltRounds: 10,
    jwtExpiresIn: '24h',
    cookieMaxAge: 7 * 24 * 60 * 60 * 1000 // שבוע
  },
  // הגדרות קורס
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_URL 
      : ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type']
  }
}; 