import express from 'express';
import {
  createTechnicianProfile,
  getTechnicians,
  getTechnicianProfile,
  updateTechnicianProfile,
  getTechnicianInspections,
  getTechnicianStats,
  updateTechnicianAvailability,
  getTechnicianCalendar,
} from '../controllers/technicianController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Public routes
router.get('/', asyncHandler(getTechnicians));
router.get('/:id', asyncHandler(getTechnicianProfile));

// Protected routes (technicians)
router.post('/profile/create', authenticateToken, authorizeRole('tecnico'), asyncHandler(createTechnicianProfile));
router.put('/profile/update', authenticateToken, authorizeRole('tecnico'), asyncHandler(updateTechnicianProfile));
router.get('/me/inspections', authenticateToken, authorizeRole('tecnico'), asyncHandler(getTechnicianInspections));
router.get('/me/statistics', authenticateToken, authorizeRole('tecnico'), asyncHandler(getTechnicianStats));
router.put('/me/availability', authenticateToken, authorizeRole('tecnico'), asyncHandler(updateTechnicianAvailability));
router.get('/me/calendar', authenticateToken, authorizeRole('tecnico'), asyncHandler(getTechnicianCalendar));

export default router;
