const rateLimit = require('express-rate-limit');

/**
 * Strict Rate Limiter for Authentication endpoints (login/register).
 * Prevents brute-force attacks.
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 10, // Higher limit in test mode
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

module.exports = {
  authRateLimiter,
};
