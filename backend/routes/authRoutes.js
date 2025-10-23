const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const upload = require('../utils/multer');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/profile/picture', authenticate, upload.single('profilePicture'), authController.uploadProfilePicture);

module.exports = router;
