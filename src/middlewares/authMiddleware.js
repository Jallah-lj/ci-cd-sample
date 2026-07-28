const { verifyAccessToken } = require('../utils/jwt');
const store = require('../db/store');

/**
 * Middleware to authenticate requests using JWT Bearer Tokens.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token is required.',
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = store.findUserById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User no longer exists.',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (_err) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired access token.',
    });
  }
}

/**
 * Middleware factory for Role-Based Access Control (RBAC).
 * @param  {...string} allowedRoles - Allowed role names (e.g. 'admin', 'user').
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions for this resource.',
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
};
