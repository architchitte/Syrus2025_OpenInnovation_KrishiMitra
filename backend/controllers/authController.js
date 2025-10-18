const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'consumer', ...otherFields } = req.body;

  // Basic validation with explicit messages
  if (!name || !name.trim()) return res.error('Name is required', 400);
  if (!email || !email.trim()) return res.error('Email is required', 400);
  if (!password) return res.error('Password is required', 400);

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.error('User with this email already exists', 400);

  // Create new user (password will be hashed by UserSchema pre-save hook)
  try {
    const user = new User({ name, email, password, role, ...otherFields });
    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    return res.success({ id: user._id, name: user.name, email: user.email, role: user.role, token }, 201);
  } catch (err) {
    // Handle mongoose validation or unique index errors
    if (err.code === 11000) {
      return res.error('Email already registered', 400);
    }
    // Log error for debugging
    console.error('Registration failed:', err);
    return res.error('Registration failed due to server error', 500);
  }
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.error('Invalid email or password', 401);

  // Verify password using schema helper if available
  const isMatch = typeof user.comparePassword === 'function' ? await user.comparePassword(password) : await bcrypt.compare(password, user.password);
  if (!isMatch) return res.error('Invalid email or password', 401);

  // Generate token
  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

  res.success({ id: user._id, name: user.name, email: user.email, role: user.role, token });
});

module.exports = { registerUser, loginUser };
