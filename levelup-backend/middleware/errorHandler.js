// Central error handler – add as LAST middleware in server.js
const { duplicateKeyMessage } = require('../utils/mongoDuplicateKey');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    return res.status(404).json({ success: false, message: error.message });
  }

  // Mongoose duplicate key (email, googleId, etc.)
  if (err.code === 11000) {
    error.message = duplicateKeyMessage(err);
    return res.status(400).json({ success: false, message: error.message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).json({ success: false, message: error.message });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  console.error('Server Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
