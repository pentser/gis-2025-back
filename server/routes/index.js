import express from 'express';
import authRoutes from './auth.routes.js';
import elderlyRoutes from './elderly.routes.js';
import volunteerRoutes from './volunteer.routes.js';
import visitRoutes from './visits.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/elderly', elderlyRoutes);
router.use('/volunteers', volunteerRoutes);
router.use('/visits', visitRoutes);
router.use('/dashboard', dashboardRoutes);

export default router; 