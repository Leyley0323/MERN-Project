const User = require('../models/User');

/**
 * Middleware to verify user authentication
 * Expects X-User-Id header with user ID
 * Adds user object to req.user if authenticated
 */
async function verifyAuth(req, res, next) {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.',
        data: null
      });
    }

    // Verify user exists in database
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid user. Please log in again.',
        data: null
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email before using this feature.',
        data: null
      });
    }

    // Add user to request object
    req.user = user;
    req.userId = userId;
    
    next();
  } catch (error) {
    console.error('[auth middleware] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error. Please try again.',
      data: null
    });
  }
}

module.exports = verifyAuth;

