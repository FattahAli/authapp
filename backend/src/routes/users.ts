import { Router } from 'express';
import { updateProfile, getAllUsers, getUserById, deleteUser } from '../controllers/users';
import { validateProfileUpdate } from '../middleware/validation';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import upload from '../utils/upload';

const router: Router = Router();

// Protected routes
router.put('/profile', authenticateToken, upload.single('profilePicture'), validateProfileUpdate, updateProfile);

router.get('/', optionalAuth, getAllUsers);
router.get('/:id', optionalAuth, getUserById);

// Protected routes for user management
router.delete('/:id', authenticateToken, deleteUser);

export default router; 