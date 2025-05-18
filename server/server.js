import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import visitsRoutes from './routes/visits.routes.js';
import elderlyRoutes from './routes/elderly.routes.js';
import volunteerRoutes from './routes/volunteer.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

// בדיקת משתני סביבה
console.log('Environment variables check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- MongoDB URI exists:', !!process.env.MONGODB_URI);
console.log('- MongoDB URI starts with:', process.env.MONGODB_URI?.substring(0, 20));

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type']
}));

// הגדרת Content-Type לכל התגובות
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// לוגים לבקשות נכנסות
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body, req.query);
  next();
});

// בדיקת תקינות השרת
app.get('/', (req, res) => {
  res.json({ message: 'ברוכים הבאים ל-GIS-2025 API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/elderly', elderlyRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// חיבור למסד הנתונים
console.log('מנסה להתחבר למסד הנתונים...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB database successfully!');
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('שגיאה מפורטת בהתחברות למסד הנתונים:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  });

// טיפול בשגיאות כדי למנוע החזרת HTML
app.use((err, req, res, next) => {
  console.error('שגיאת שרת:', err);
  res.status(500).json({
    error: true,
    message: err.message || 'שגיאת שרת פנימית',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// טיפול ב-404 כדי להחזיר JSON במקום דף HTML
app.use((req, res) => {
  console.log(`דף לא נמצא: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'הדף המבוקש לא נמצא' });
}); 