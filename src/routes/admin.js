import express from 'express';
import {
  getDashboard,
  getAllTechnicians,
  manageTechnician,
  getInspectionReports,
  getRevenueAnalytics,
  getUserManagement,
  deactivateUser,
  activateUser,
  getSystemMetrics,
} from '../controllers/adminController.js';
import { authenticateToken, verifyAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken, verifyAdmin);

// Dashboard
router.get('/dashboard', asyncHandler(getDashboard));
router.get('/system-metrics', asyncHandler(getSystemMetrics));

// Technician management
router.get('/technicians', asyncHandler(getAllTechnicians));
router.put('/technicians/:id', asyncHandler(manageTechnician));

// Reports
router.get('/inspection-reports', asyncHandler(getInspectionReports));
router.get('/revenue-analytics', asyncHandler(getRevenueAnalytics));

// User management
router.get('/users', asyncHandler(getUserManagement));
router.post('/users/:id/deactivate', asyncHandler(deactivateUser));
router.post('/users/:id/activate', asyncHandler(activateUser));

export default router;
