import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import visitsRoutes from './routes/visits.routes.js';

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

app.use(express.json());

// לוגים לבקשות נכנסות
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
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

// חיבור למסד הנתונים
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('מחובר למסד הנתונים MongoDB'))
  .catch(err => console.error('שגיאה בהתחברות למסד הנתונים:', err));

// הפעלת השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`השרת פועל בפורט ${PORT}`);
}); 