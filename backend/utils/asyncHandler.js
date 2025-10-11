// Simple async handler to wrap async route handlers and forward errors to next()
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
