const jwt = require('jsonwebtoken');
const { promisify } = require('util');

// Middleware to protect routes that require authentication
const authenticate = async (req, res, next) => {
  try {
    // 1) Get token from Authorization header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in to access this resource.'
      });
    }

    // 2) Verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const db = require('../config/database');
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

    if (!user.length) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4) Grant access to protected route
    req.user = user[0];
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token or authorization error.'
    });
  }
};

module.exports = {
  authenticate
};
