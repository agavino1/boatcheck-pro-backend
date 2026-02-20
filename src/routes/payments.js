import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPaymentById,
  refundPayment,
  handleWebhook,
  getRevenueStats,
} from '../controllers/paymentController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Webhook route (public, but signature verification is done inside)
router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(handleWebhook));

// Protected routes
router.post('/create-intent', authenticateToken, asyncHandler(createPaymentIntent));
router.post('/confirm', authenticateToken, asyncHandler(confirmPayment));
router.get('/history', authenticateToken, asyncHandler(getPaymentHistory));
router.get('/:id', authenticateToken, asyncHandler(getPaymentById));
router.post('/:id/refund', authenticateToken, authorizeRole('admin'), asyncHandler(refundPayment));

// Admin routes
router.get('/admin/revenue-stats', authenticateToken, authorizeRole('admin'), asyncHandler(getRevenueStats));

export default router;
