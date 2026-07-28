const store = require('../db/store');
const { hashPassword, comparePassword } = require('../utils/password');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');

/**
 * Register a new user account.
 */
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name, email, and password are required fields.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existingUser = store.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await hashPassword(password);
    const user = store.createUser({
      name,
      email,
      passwordHash,
      role: role === 'admin' ? 'admin' : 'user',
    });

    const accessToken = generateAccessToken({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ sub: user.id, email: user.email, role: user.role });

    store.saveRefreshToken(refreshToken);

    return res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
}

/**
 * Login user and issue Access and Refresh Tokens.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required.',
      });
    }

    const user = store.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    const accessToken = generateAccessToken({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ sub: user.id, email: user.email, role: user.role });

    store.saveRefreshToken(refreshToken);

    return res.status(200).json({
      message: 'Login successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
}

/**
 * Rotate Refresh Token and issue new Access Token.
 */
async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Refresh token is required.',
      });
    }

    if (!store.hasRefreshToken(refreshToken)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Refresh token has been revoked or is invalid.',
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = store.findUserById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User no longer exists.',
      });
    }

    // Revoke old refresh token (Token Rotation)
    store.removeRefreshToken(refreshToken);

    // Issue new token pair
    const newAccessToken = generateAccessToken({ sub: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ sub: user.id, email: user.email, role: user.role });

    store.saveRefreshToken(newRefreshToken);

    return res.status(200).json({
      message: 'Token refreshed successfully.',
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired refresh token.',
    });
  }
}

/**
 * Revoke Refresh Token (Logout).
 */
async function logout(req, res) {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      store.removeRefreshToken(refreshToken);
    }

    return res.status(200).json({
      message: 'Logged out successfully.',
    });
  } catch (_err) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process logout.',
    });
  }
}

/**
 * Get authenticated user profile.
 */
async function getProfile(req, res) {
  return res.status(200).json({
    user: req.user,
  });
}

/**
 * Get Admin Dashboard (Role Protected).
 */
async function getAdminDashboard(req, res) {
  return res.status(200).json({
    message: 'Welcome to the Admin Vault Dashboard!',
    admin: req.user,
  });
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  getProfile,
  getAdminDashboard,
};
