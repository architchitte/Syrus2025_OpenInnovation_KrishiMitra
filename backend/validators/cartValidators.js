const { body, param } = require('express-validator');

const validateAddToCart = [
  body('productId').isMongoId().withMessage('productId must be a valid Mongo id'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be an integer >= 1')
];

const validateUpdateCart = [
  param('productId').isMongoId().withMessage('productId must be a valid Mongo id'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be an integer >= 1')
];

module.exports = { validateAddToCart, validateUpdateCart };
