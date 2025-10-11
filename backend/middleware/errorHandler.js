const logger = require('../utils/logger');

// Centralized error handling middleware
function errorHandler(err, req, res, next) {
  // If headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // Log the error
  logger.error(err.stack || err.message || err);

  const statusCode = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message
  });
}

module.exports = { errorHandler };
