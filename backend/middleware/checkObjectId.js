const mongoose = require('mongoose');

// Returns middleware that checks a param or body field is a valid ObjectId
// usage: checkObjectId('productId', { in: 'params' }) or checkObjectId('productId') defaults to params
module.exports = (fieldName, opts = { in: 'params' }) => (req, res, next) => {
  const value = opts.in === 'body' ? req.body[fieldName] : req.params[fieldName];
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({ success: false, error: { message: `${fieldName} is not a valid id` } });
  }
  next();
};
