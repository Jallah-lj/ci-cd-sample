const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  getProfile,
  getAdminDashboard,
} = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { authRateLimiter } = require('../middlewares/rateLimiter');

// Public Auth Endpoints
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected User Endpoint
router.get('/me', authenticateToken, getProfile);

// Role-Protected Admin Endpoint
router.get('/admin', authenticateToken, authorizeRoles('admin'), getAdminDashboard);

module.exports = router;
