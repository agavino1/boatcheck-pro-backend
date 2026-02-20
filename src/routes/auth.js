import express from 'express';
import { register, login, verifyEmail, logout, refreshToken, resendVerificationEmail } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/verify-email/:token', asyncHandler(verifyEmail));
router.post('/resend-verification', asyncHandler(resendVerificationEmail));
router.post('/logout', asyncHandler(logout));
router.post('/refresh-token', authenticateToken, asyncHandler(refreshToken));

export default router;
