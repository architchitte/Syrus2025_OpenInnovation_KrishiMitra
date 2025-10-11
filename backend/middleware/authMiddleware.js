const jwt = require('jsonwebtoken');
const User = require('../models/User');
const tokenBlacklist = require('../utils/tokenBlacklist');

// Ensure JWT_SECRET exists at module load time
if (!process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.error('JWT_SECRET is not defined in environment variables');
  // do not exit here — server startup will validate envs in server.js
}

// Protect middleware: verifies JWT, checks blacklist, attaches user to req
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Not authorized, token missing' });
  }

  const token = authHeader.split(' ')[1];

  // Check blacklist
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ success: false, error: 'Token has been revoked' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    // attach user document for downstream handlers
    req.user = user;
    next();
  } catch (err) {
    // Distinguish token errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired' });
    }
    // Invalid token or other jwt errors
    return res.status(401).json({ success: false, error: 'Token invalid' });
  }
};

// restrictTo middleware to limit by roles
const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }
  next();
};

// Convenience middlewares
const admin = restrictTo('admin');
const farmer = restrictTo('farmer');

module.exports = { protect, restrictTo, admin, farmer };
