import { Router } from 'express';
import { signup, login, logout, getMe, oauthLogin, resetPassword } from '../controllers/auth';
import { validateSignup, validateLogin, validatePasswordReset } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import upload from '../utils/upload';

const router: Router = Router();

router.post('/signup', upload.single('profilePicture'), validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/oauth/login', oauthLogin);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticateToken, getMe);
router.post('/reset-password', authenticateToken, validatePasswordReset, resetPassword);

export default router; 