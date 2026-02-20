import express from 'express';
import { getProfile, updateProfile, getMyInspections, getAllUsers, getUserById, updateUser, deleteUser, getStatistics } from '../controllers/userController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Public routes
router.get('/:id', asyncHandler(getUserById));

// Protected routes
router.get('/profile/me', authenticateToken, asyncHandler(getProfile));
router.put('/profile/me', authenticateToken, asyncHandler(updateProfile));
router.get('/me/inspections', authenticateToken, asyncHandler(getMyInspections));
router.get('/me/statistics', authenticateToken, asyncHandler(getStatistics));

// Admin routes
router.get('/', authenticateToken, authorizeRole('admin'), asyncHandler(getAllUsers));
router.put('/:id', authenticateToken, authorizeRole('admin'), asyncHandler(updateUser));
router.delete('/:id', authenticateToken, authorizeRole('admin'), asyncHandler(deleteUser));

export default router;
