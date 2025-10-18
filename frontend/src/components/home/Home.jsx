import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaWarehouse, FaHandshake, FaShoppingCart, FaArrowRight, FaLeaf, FaTruck, FaCheckCircle, FaStar, FaBox, FaSeedling, FaUsers, FaChartLine, FaSearch } from 'react-icons/fa';
import { getAllProducts } from '../../utils/productApi';
import { motion } from 'framer-motion';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const products = await getAllProducts();
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        setFeaturedProducts(shuffled.slice(0, 4));
      } catch (err) {
        setError(err.message || 'Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[85vh] bg-gradient-to-br from-green-900 via-green-800 to-green-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581349485608-9469926a8e5e?q=80&w=1470')] bg-cover bg-center opacity-10"></div>
        
        {/* Floating Elements */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1 }}
          className="absolute top-20 right-10 w-64 h-64 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"
        ></motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute bottom-20 left-10 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"
        ></motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"
        ></motion.div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="text-white max-w-2xl"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium"
            >
              <span className="flex items-center">
                <FaSeedling className="mr-2 text-green-300" />
                Revolutionizing Agriculture in India
              </span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg"
            >
            <span className="text-green-300">Fresh From Farm To Your Table</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl mb-10 text-white/90 leading-relaxed drop-shadow-md"
            >
              Connecting farmers directly to consumers for fresher produce, better prices, and a sustainable future.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-6"
            >
              <Link
                to="/products"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl bg-blue-500 text-white shadow-lg hover:shadow-xl hover:bg-blue-600 transition-all duration-300"
              >
                Shop Now 
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/dashboard"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl border-2 border-white text-white hover:bg-white hover:text-green-800 transition-all duration-300"
              >
                Farmer Dashboard
                <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div 
              variants={fadeInUp} 
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <FaUsers className="text-2xl text-green-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">10,000+</h3>
                  <p className="text-gray-600">Active Farmers</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <FaShoppingCart className="text-2xl text-green-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">50,000+</h3>
                  <p className="text-gray-600">Happy Customers</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <FaChartLine className="text-2xl text-green-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">₹2Cr+</h3>
                  <p className="text-gray-600">Farmer Earnings</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
              Our Services
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Empowering Agriculture
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how KrishiMitra is revolutionizing the way farmers and consumers connect
            </p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            <motion.div 
              variants={fadeInUp} 
              whileHover={{ y: -8 }}
              className="group bg-white p-10 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-green-200 transition-colors duration-300">
                <FaWarehouse className="text-3xl text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Cold Storage Facilities</h3>
              <p className="text-gray-600 mb-8 text-lg">
                Book cold storage for your produce to extend shelf life and reduce waste.
              </p>
              <Link
                to="/cold-storage"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium group"
              >
                Book Storage <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -8 }}
              className="group bg-white p-10 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-green-200 transition-colors duration-300">
                <FaHandshake className="text-3xl text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Bulk Buy Negotiation</h3>
              <p className="text-gray-600 mb-8 text-lg">
                Negotiate directly with farmers for bulk purchases at wholesale prices.
              </p>
              <Link
                to="/bulk-buy"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium group"
              >
                Start Negotiation <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -8 }}
              className="group bg-white p-10 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-green-200 transition-colors duration-300">
                <FaShoppingCart className="text-3xl text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Farm Fresh Marketplace</h3>
              <p className="text-gray-600 mb-8 text-lg">
                Browse and buy fresh produce directly from local farmers near you.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium group"
              >
                Shop Products <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-center mb-16"
          >
            <div className="mb-6 md:mb-0">
              <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
                Fresh Picks
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-xl text-gray-600">Fresh produce from our trusted farmers</p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-lg group"
            >
              View All <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 bg-red-50 p-4 rounded-xl">
              {error}
            </div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {featuredProducts.map((product) => (
                <motion.div
                  key={product._id}
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <Link to={`/products/${product._id}`}>
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                        Fresh
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-1 mb-2">
                        <FaStar className="text-yellow-400" />
                        <span className="text-gray-600 text-sm">{product.rating}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{product.name}</h3>
                      <p className="text-gray-600 mb-3">by {product.seller?.name || 'Unknown Seller'}</p>
                      <p className="text-gray-600 flex items-center mb-6">
                        <FaLeaf className="mr-2 text-green-500" />
                        {product.category}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{product.price}
                          <span className="text-sm font-normal text-gray-600">/{product.unit}</span>
                        </span>
                        <span className="text-sm text-gray-500">{product.quantity} {product.unit}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              How KrishiMitra Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to connect farmers and consumers
            </p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
          >
            {[
              {
                number: '1',
                title: 'Farmers List Produce',
                description: 'Farmers list their fresh produce, set prices, and manage inventory.',
                icon: <FaLeaf className="text-white text-lg" />
              },
              {
                number: '2',
                title: 'Consumers Shop',
                description: 'Consumers browse, select products, and place orders directly from farmers.',
                icon: <FaShoppingCart className="text-white text-lg" />
              },
              {
                number: '3',
                title: 'Delivery or Pickup',
                description: 'Products are delivered to your doorstep or available for farm pickup.',
                icon: <FaTruck className="text-white text-lg" />
              },
              {
                number: '4',
                title: 'Support Local Farming',
                description: 'Fair prices for farmers and fresh produce for consumers.',
                icon: <FaCheckCircle className="text-white text-lg" />
              }
            ].map((step, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                className="relative"
              >
                <div className="bg-white p-10 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-md">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 text-lg">{step.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 z-10">
                    <div className="w-8 h-0.5 bg-green-200"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-green-900 via-green-800 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1470')] bg-cover bg-center opacity-10"></div>
        
        {/* Floating Elements */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1 }}
          className="absolute top-20 right-10 w-64 h-64 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"
        ></motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute bottom-20 left-10 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"
        ></motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 drop-shadow-md">
            Ready to get started?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-16 max-w-3xl mx-auto drop-shadow-sm">
            Join thousands of farmers and consumers already using KrishiMitra.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-8">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center px-10 py-5 text-lg font-medium rounded-xl bg-white text-green-800 shadow-lg hover:shadow-xl hover:bg-green-50 transition-all duration-300"
            >
              Register Now
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="group inline-flex items-center justify-center px-10 py-5 text-lg font-medium rounded-xl border-2 border-white text-white hover:bg-white hover:text-green-800 transition-all duration-300"
            >
              Learn More
              <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home; 