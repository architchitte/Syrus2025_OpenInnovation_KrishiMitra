const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Get all products with pagination and filters
exports.getProducts = asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice, isOrganic, sortBy } = req.query;
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const pageSize = Math.min(parseInt(req.query.pageSize || '20', 10), 100);

  const skip = (page - 1) * pageSize;

  let query = {};
  if (category) query.category = category;
  if (isOrganic === 'true') query.isOrganic = true;
  if (search) query.name = { $regex: search, $options: 'i' };
  if (minPrice && maxPrice) query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
  else if (minPrice) query.price = { $gte: parseFloat(minPrice) };
  else if (maxPrice) query.price = { $lte: parseFloat(maxPrice) };

  let sortOptions = {};
  if (sortBy === 'price-asc') sortOptions.price = 1;
  else if (sortBy === 'price-desc') sortOptions.price = -1;
  else if (sortBy === 'newest') sortOptions.createdAt = -1;
  else if (sortBy === 'rating') sortOptions.rating = -1;
  else sortOptions.createdAt = -1;

  const [items, total] = await Promise.all([
    Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize)
      .populate('farmerId', 'name farmName farmLocation')
      .lean(),
    Product.countDocuments(query)
  ]);

  const meta = {
    page,
    pageSize,
    total,
    hasMore: skip + items.length < total
  };

  res.success({ items, meta });
});

// Get a single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmerId', 'name farmName farmLocation farmDescription');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new product (farmers only)
exports.createProduct = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.role !== 'farmer') {
      return res.status(403).json({ message: 'Only farmers can create products' });
    }
    
    const { name, description, price, category, image, quantity, unit, location, isOrganic, discountPrice } = req.body;

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      category,
      image,
      quantity,
      unit,
      location,
      isOrganic,
      farmerId: req.user.id
    });
    
    await product.save();
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a product (farmers only)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if the user is the owner of the product
    if (product.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this product' });
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a product (farmers only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if the user is the owner of the product
    if (product.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this product' });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get farmer products
exports.getFarmerProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.user.id });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching farmer products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a review to a product
exports.addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.userId.toString() === req.user.id
    );
    
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }
    
    const review = {
      userId: req.user.id,
      rating: Number(rating),
      comment
    };
    
    product.reviews.push(review);
    
    // Update product rating
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
    
    await product.save();
    
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Bulk upload products
exports.bulkUploadProducts = async (req, res) => {
  try {
    const products = req.body;
    
    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be an array of products'
      });
    }

    // Validate each product
    const validatedProducts = products.map(product => ({
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      category: product.category,
      quantity: product.quantity,
      unit: product.unit,
      // Accept farmerId (preferred) or fallback to farmer name field if provided
      farmerId: product.farmerId || product.farmer || null,
      location: product.location,
      isOrganic: product.isOrganic || false,
      harvestDate: product.harvestDate || new Date(),
  rating: product.rating || 0,
  reviews: Array.isArray(product.reviews) ? product.reviews : []
    }));

    // Use bulkWrite with ordered: false to continue processing even if some documents fail
    const result = await Product.bulkWrite(
      validatedProducts.map(product => ({
        updateOne: {
            filter: { name: product.name, farmerId: product.farmerId || product.farmer },
            update: { $set: product },
            upsert: true
          }
      })),
      { ordered: false }
    );

    res.status(200).json({
      success: true,
      message: 'Products uploaded successfully',
      data: {
        inserted: result.upsertedCount,
        modified: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error in bulkUploadProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading products',
      error: error.message
    });
  }
}; 