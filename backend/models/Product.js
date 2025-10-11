const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Product image URL is required']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Product quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Product unit is required'],
    trim: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer id is required']
  },
  location: {
    type: String,
    required: [true, 'Product location is required'],
    trim: true
  },
  isOrganic: {
    type: Boolean,
    default: false
  },
  harvestDate: {
    type: Date,
    default: Date.now
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5
    },
    comment: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for common queries
productSchema.index({ name: 1, farmerId: 1 }, { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 