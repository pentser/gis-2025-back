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
import healthRoutes from './routes/health.routes.js';

dotenv.config();

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
app.use('/api', healthRoutes);

// חיבור למסד הנתונים
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('מחובר למסד הנתונים MongoDB');
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`השרת פועל בפורט ${port}`);
    });
  })
  .catch((error) => {
    console.error('שגיאה בהתחברות למסד הנתונים:', error);
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