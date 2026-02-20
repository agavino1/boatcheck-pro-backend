import express from 'express';
import { 
  createInspection, 
  getInspections, 
  getInspectionById, 
  updateInspection, 
  assignTechnician, 
  completeInspection, 
  cancelInspection, 
  rateInspection, 
  deleteInspection 
} from '../controllers/inspectionController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Protected routes
router.post('/', authenticateToken, asyncHandler(createInspection));
router.get('/', authenticateToken, asyncHandler(getInspections));
router.get('/:id', authenticateToken, asyncHandler(getInspectionById));
router.put('/:id', authenticateToken, asyncHandler(updateInspection));
router.post('/:id/rate', authenticateToken, asyncHandler(rateInspection));
router.delete('/:id', authenticateToken, asyncHandler(deleteInspection));

// Admin/Technician routes
router.post('/:id/assign-technician', authenticateToken, authorizeRole('admin'), asyncHandler(assignTechnician));
router.post('/:id/complete', authenticateToken, authorizeRole('tecnico', 'admin'), asyncHandler(completeInspection));
router.post('/:id/cancel', authenticateToken, authorizeRole('admin'), asyncHandler(cancelInspection));

export default router;
