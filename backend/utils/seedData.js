const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Sample data for seeding the database
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Farmer John',
    email: 'farmer@example.com',
    password: 'password123',
    role: 'farmer',
    farmName: 'Green Valley Farm',
    farmLocation: 'Mumbai, Maharashtra',
    farmDescription: 'We specialize in organic vegetables and fruits.',
    productsGrown: ['vegetables', 'fruits'],
    isVerified: true
  },
  {
    name: 'Consumer User',
    email: 'consumer@example.com',
    password: 'password123',
    role: 'consumer',
    address: '123 Main St',
    city: 'Delhi',
    state: 'Delhi',
    postalCode: '110001'
  }
];

const categories = [
  {
    name: 'Fruits & Vegetables',
    description: 'Fresh fruits and vegetables directly from farms',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=2070'
  },
  {
    name: 'Dairy Products',
    description: 'Fresh dairy products including milk, cheese, and more',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=2070'
  },
  {
    name: 'Grains & Cereals',
    description: 'Whole grains and cereals',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1c5a186f7?q=80&w=2070'
  },
  {
    name: 'Spices & Herbs',
    description: 'Fresh and dried spices and herbs',
    image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=2070'
  }
];

const products = [
  {
    name: 'Organic Tomatoes',
    description: 'Fresh organic tomatoes grown without pesticides',
    price: 40,
    discountPrice: 35,
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfad?q=80&w=2070',
    stock: 50,
    isOrganic: true
  },
  {
    name: 'Fresh Spinach',
    description: 'Locally grown spinach, perfect for salads and cooking',
    price: 30,
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=2432',
    stock: 30,
    isOrganic: true
  },
  {
    name: 'Whole Wheat Flour',
    description: 'Stone-ground whole wheat flour for baking',
    price: 60,
    discountPrice: 55,
    category: 'Grains & Cereals',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072',
    stock: 100,
    isOrganic: false
  },
  {
    name: 'Farm Fresh Milk',
    description: 'Fresh cow milk delivered daily',
    price: 50,
    category: 'Dairy Products',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=2070',
    stock: 20,
    isOrganic: true
  },
  {
    name: 'Turmeric Powder',
    description: 'Organic turmeric powder for cooking and health benefits',
    price: 80,
    category: 'Spices & Herbs',
    image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f1?q=80&w=2070',
    stock: 40,
    isOrganic: true
  }
];

const seedData = async (force = false) => {
  try {
    const existing = await User.countDocuments();
    if (!force && existing > 0) {
      console.log('Database already has users; skipping seedData. Use seedData(true) to force.');
      return;
    }

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log('Data cleared from database');

    // Create users
    const createdUsers = [];
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      const newUser = await User.create({
        ...user,
        password: hashedPassword
      });
      createdUsers.push(newUser);
    }

    console.log('Users created');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories created');

    // Create products (assign to farmer)
    const farmerId = createdUsers.find(user => user.role === 'farmer')._id;

    for (const product of products) {
      const category = await Category.findOne({ name: product.category });
      
      await Product.create({
        ...product,
        farmerId,
        category: category.name
      });
    }

    console.log('Products created');
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};

module.exports = seedData;