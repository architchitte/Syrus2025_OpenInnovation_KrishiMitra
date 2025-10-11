// Attach helper methods to res for consistent responses
function responseHandler(req, res, next) {
  res.success = (data, status = 200) => res.status(status).json({ success: true, data });
  res.error = (message, status = 400) => res.status(status).json({ success: false, error: { message } });
  next();
}

module.exports = responseHandler;
