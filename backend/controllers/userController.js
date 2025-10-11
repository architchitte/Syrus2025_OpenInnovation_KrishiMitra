const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// Get user profile
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password').lean();
  if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
  res.success(user);
});

// Update user profile
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const {
    name,
    phoneNumber,
    address,
    city,
    state,
    postalCode,
    farmName,
    farmLocation,
    farmDescription,
    productsGrown
  } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phoneNumber) updateData.phoneNumber = phoneNumber;
  if (address) updateData.address = address;
  if (city) updateData.city = city;
  if (state) updateData.state = state;
  if (postalCode) updateData.postalCode = postalCode;

  // Update farmer-specific fields if user is a farmer
  const user = await User.findById(req.user.id).lean();
  if (user && user.role === 'farmer') {
    if (farmName) updateData.farmName = farmName;
    if (farmLocation) updateData.farmLocation = farmLocation;
    if (farmDescription) updateData.farmDescription = farmDescription;
    if (productsGrown) updateData.productsGrown = productsGrown;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, { $set: updateData }, { new: true }).select('-password').lean();
  res.success(updatedUser);
});

// Add item to cart
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.error('Invalid productId', 400);
  }
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty < 1) return res.error('Quantity must be >= 1', 400);

  // Validate product and stock
  const product = await Product.findById(productId).select('stock name price');
  if (!product) return res.error('Product not found', 404);
  if (product.stock < qty) return res.error('Not enough stock available', 400);

  // Try atomic update: update quantity if exists, else push
  const updated = await User.findOneAndUpdate(
    { _id: req.user._id, 'cart.productId': productId },
    { $set: { 'cart.$.quantity': qty } },
    { new: true }
  ).populate({ path: 'cart.productId', select: 'name price image stock' }).lean();

  if (updated) return res.success(updated.cart);

  // if not updated (item not in cart), push new item
  const pushed = await User.findByIdAndUpdate(
    req.user._id,
    { $push: { cart: { productId, quantity: qty } } },
    { new: true }
  ).populate({ path: 'cart.productId', select: 'name price image stock' }).lean();

  res.success(pushed.cart);
});

// Remove item from cart
exports.removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) return res.error('Invalid productId', 400);

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { cart: { productId } } },
    { new: true }
  ).populate({ path: 'cart.productId', select: 'name price image stock' }).lean();

  res.success(updated.cart);
});

// Get cart
exports.getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({ path: 'cart.productId', select: 'name price image stock' }).lean();
  res.success(user.cart);
});

// Clear cart
exports.clearCart = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });
  res.success([], 200);
});

// Add to wishlist
exports.addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(productId)) return res.error('Invalid productId', 400);

  const product = await Product.findById(productId).select('_id');
  if (!product) return res.error('Product not found', 404);

  const updated = await User.findOneAndUpdate(
    { _id: req.user._id, wishlist: { $ne: productId } },
    { $push: { wishlist: productId } },
    { new: true }
  ).populate({ path: 'wishlist', select: 'name price image' }).lean();

  if (!updated) return res.error('Product already in wishlist', 400);

  res.success(updated.wishlist);
});

// Remove from wishlist
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) return res.error('Invalid productId', 400);

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: productId } },
    { new: true }
  ).populate({ path: 'wishlist', select: 'name price image' }).lean();

  res.success(updated.wishlist);
});

// Get wishlist
exports.getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({ path: 'wishlist', select: 'name price image' }).lean();
  res.success(user.wishlist);
});