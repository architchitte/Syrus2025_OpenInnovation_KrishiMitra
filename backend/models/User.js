const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['consumer', 'farmer', 'admin'], default: 'consumer' },
  phoneNumber: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  // Farmer specific fields
  farmName: { type: String },
  farmLocation: { type: String },
  farmDescription: { type: String },
  productsGrown: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  // Consumer specific fields
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1, min: [1, 'Quantity must be at least 1'] }
    }
  ],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hide sensitive fields
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

// Password compare helper
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Hash password before saving when modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Generate JWT token helper
UserSchema.methods.generateAuthToken = function (expiresIn = '30d') {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  const payload = { id: this._id, email: this.email, role: this.role };
  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Indexes
// Email already has unique: true on the field definition; avoid duplicate index declarations

module.exports = mongoose.model('User', UserSchema);
