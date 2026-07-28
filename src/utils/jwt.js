const jwt = require('jsonwebtoken');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default_access_secret_key_change_in_prod_123';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key_change_in_prod_456';

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Generate an Access Token.
 * @param {object} payload - User claims.
 * @returns {string} Signed JWT Access Token.
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

/**
 * Generate a Refresh Token with unique jti.
 * @param {object} payload - User claims.
 * @returns {string} Signed JWT Refresh Token.
 */
function generateRefreshToken(payload) {
  const tokenPayload = {
    ...payload,
    jti: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  };
  return jwt.sign(tokenPayload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

/**
 * Verify an Access Token.
 * @param {string} token - JWT Access Token.
 * @returns {object} Decoded token payload.
 */
function verifyAccessToken(token) {
  return jwt.verify(token, JWT_ACCESS_SECRET);
}

/**
 * Verify a Refresh Token.
 * @param {string} token - JWT Refresh Token.
 * @returns {object} Decoded token payload.
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
