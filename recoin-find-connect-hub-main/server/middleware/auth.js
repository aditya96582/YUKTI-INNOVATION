/**
 * JWT Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const { User } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_ai_jwt_secret_2026_production_key';

/**
 * Generate JWT token for user
 */
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

/**
 * Middleware: Verify JWT and attach user to req
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired' });
    }
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

/**
 * Optional auth — attach user if token present, but don't block
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
        req.userId = user._id.toString();
      }
    }
  } catch {
    // Silently ignore auth errors for optional auth
  }
  next();
}

module.exports = { authenticate, optionalAuth, generateToken, JWT_SECRET };
