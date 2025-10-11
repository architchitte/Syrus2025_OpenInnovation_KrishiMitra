const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  addToCart,
  removeFromCart,
  getCart,
  clearCart,
  addToWishlist,
  removeFromWishlist,
  getWishlist
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const checkObjectId = require('../middleware/checkObjectId');
const { validateAddToCart, validateUpdateCart } = require('../validators/cartValidators');

const router = express.Router();

// Profile routes
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

// Cart routes
router
  .route('/cart')
  .get(protect, getCart)
  .post(protect, validateAddToCart, validateRequest, addToCart);

router
  .route('/cart/:productId')
  .put(protect, validateUpdateCart, validateRequest, addToCart)
  .delete(protect, checkObjectId('productId'), validateRequest, removeFromCart);

router.delete('/cart', protect, clearCart);

// Wishlist routes
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist', protect, [checkObjectId('productId', { in: 'body' }), validateRequest], addToWishlist);
router.delete('/wishlist/:productId', protect, checkObjectId('productId'), validateRequest, removeFromWishlist);

module.exports = router;