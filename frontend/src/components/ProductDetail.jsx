import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './layout/Navbar';
import { addToCart } from '../utils/cartApi';
import { fetchProductImages } from '../utils/imageApi';

import api from '../utils/api';

// Fallback product data
const fallbackProducts = [
  {
    _id: '1',
    name: 'Organic Tomatoes',
    description: 'Fresh organic tomatoes grown without pesticides. These bright red tomatoes are harvested at peak ripeness to ensure the best flavor and nutrient content. Our tomatoes are grown using sustainable farming practices without synthetic fertilizers or pesticides.',
    price: 40,
    discountPrice: 35,
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfad?q=80&w=2070',
    stock: 50,
    rating: 4.5,
    reviewCount: 28,
    isOrganic: true,
    farmer: {
      name: 'Ravi Kumar',
      location: 'Nashik, Maharashtra',
      image: 'https://images.unsplash.com/photo-1553787499-6f9133860278?w=500'
    },
    additionalImages: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfad?q=80&w=2070',
      'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500',
      'https://images.unsplash.com/photo-1524593166156-312f362cada0?w=500'
    ],
    nutritionFacts: {
      calories: '18 kcal',
      protein: '0.9g',
      carbs: '3.9g',
      fiber: '1.2g',
      vitaminC: '28% of Daily Value'
    }
  },
  // Additional fallback products would go here
];

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00'
  });
  const [activeTab, setActiveTab] = useState('description');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
  const response = await api.get(`/products/${id}`);
        
        // Enhance product with additional images if needed
        let productData = response.data;
        
        // If product doesn't have additional images, fetch some
        if (!productData.additionalImages || productData.additionalImages.length < 2) {
          try {
            const images = await fetchProductImages(productData.name, 3);
            productData = {
              ...productData,
              additionalImages: [productData.image, ...images.map(img => img.url)]
            };
          } catch (imageError) {
            console.error('Error fetching additional images:', imageError);
          }
        }
        
        setProduct(productData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        // Use fallback product data
        const fallbackProduct = fallbackProducts.find(p => p._id === id);
        if (fallbackProduct) {
          setProduct(fallbackProduct);
        } else {
          // Create a generic product if not found, to avoid "product not found" error
          const genericProduct = {
            _id: id,
            name: 'Organic Product',
            description: 'A high-quality organic product from local farmers.',
            price: 99,
            category: 'Organic Products',
            image: `https://source.unsplash.com/800x600/?organic,vegetables`,
            additionalImages: [
              `https://source.unsplash.com/800x600/?organic,vegetables`,
              `https://source.unsplash.com/800x600/?food,organic`,
              `https://source.unsplash.com/800x600/?farm,produce`
            ],
            stock: 10,
            isOrganic: true,
            rating: 4.0,
            reviewCount: 12,
            farmer: {
              name: 'Local Farmer',
              location: 'Rural Farms, India',
              image: 'https://images.unsplash.com/photo-1597931752949-98c74b5b159f?w=500'
            },
          };
          setProduct(genericProduct);
        }
        setLoading(false);
      }
    };

    // Set a timer for offer countdown
    const interval = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay - now;
      const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const minutes = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0');
      const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
      
      setTimeRemaining({ hours, minutes, seconds });
    }, 1000);

    fetchProduct();

    return () => clearInterval(interval);
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add items to your cart');
      return;
    }
    
    try {
      await addToCart(product._id, quantity);
      alert(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.message === 'Authentication required') {
        alert('Please log in to add items to your cart');
      } else {
        alert('Failed to add to cart. Please try again.');
      }
    }
  };

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToWishlist = async () => {
    if (!token) {
      alert('Please login to add items to wishlist');
      return;
    }

      try {
        await api.post('/users/wishlist', { productId: id });
      alert('Product added to wishlist');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Product added to wishlist locally');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error || 'Product not found'}
          </div>
          <div className="mt-4">
            <Link to="/" className="text-green-600 hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = product.additionalImages || [product.image];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="text-sm text-gray-500">
          <Link to="/" className="hover:text-green-600">Home</Link> {' > '}
          <Link to={`/category/${product.category?.replace(' & ', '-').toLowerCase()}`} className="hover:text-green-600">{product.category}</Link> {' > '}
          <span className="text-gray-700">{product.name}</span>
        </div>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row -mx-4">
            {/* Product Images */}
            <div className="lg:w-2/5 px-4 mb-6 lg:mb-0">
              <div className="relative mb-4">
                {product.isOrganic && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center">
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 12L11 15L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      ORGANIC
                    </div>
                  </div>
                )}
                {product.discountPrice && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      SALE
                    </div>
                  </div>
                )}
                <img 
                  src={images[mainImage]} 
                  alt={product.name} 
                  className="w-full h-96 object-contain rounded-lg"
                />
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <div 
                    key={index}
                    className={`w-20 h-20 flex-shrink-0 cursor-pointer border-2 rounded ${mainImage === index ? 'border-green-500' : 'border-gray-200'}`}
                    onClick={() => setMainImage(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:w-3/5 px-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              {/* Farmer Info */}
              {product.farmer && (
                <div className="flex items-center mb-4">
                  <img 
                    src={product.farmer.image} 
                    alt={product.farmer.name}
                    className="w-8 h-8 rounded-full object-cover mr-2"
                  />
                  <div>
                    <p className="text-sm text-gray-600">Grown by <span className="font-medium">{product.farmer.name}</span></p>
                    <p className="text-xs text-gray-500">{product.farmer.location}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-gray-600">{product.rating || 0} ({product.reviewCount || 0} reviews)</span>
                {product.stock > 0 ? (
                  <span className="ml-4 text-green-600">● In Stock</span>
                ) : (
                  <span className="ml-4 text-red-600">● Out of Stock</span>
                )}
              </div>
              
              <div className="flex items-center mb-6">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl font-bold text-red-600">₹{product.discountPrice}</span>
                    <span className="ml-2 text-xl text-gray-500 line-through">₹{product.price}</span>
                    <span className="ml-2 text-green-600 bg-green-100 px-2 py-0.5 rounded text-sm">
                      {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                )}
              </div>
              
              {/* Special Offer Timer */}
              {product.discountPrice && (
                <div className="bg-orange-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-orange-600 font-semibold">Krishi-Connect Special Offer Ends In:</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="bg-white px-3 py-2 rounded-lg">
                      <span className="text-2xl font-mono">{timeRemaining.hours}</span>
                      <span className="text-xs text-gray-500 block">Hours</span>
                    </div>
                    <div className="bg-white px-3 py-2 rounded-lg">
                      <span className="text-2xl font-mono">{timeRemaining.minutes}</span>
                      <span className="text-xs text-gray-500 block">Minutes</span>
                    </div>
                    <div className="bg-white px-3 py-2 rounded-lg">
                      <span className="text-2xl font-mono">{timeRemaining.seconds}</span>
                      <span className="text-xs text-gray-500 block">Seconds</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Add to Cart */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex border border-gray-300 rounded-md">
                  <button 
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={product.stock === 0}
                  >
                    −
                  </button>
                  <span className="px-4 py-2 border-l border-r border-gray-300">{quantity}</span>
                  <button 
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                    onClick={() => handleQuantityChange(1)}
                    disabled={product.stock === 0}
                  >
                    +
                  </button>
                </div>
                
                <button 
                  className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                
                <button className="bg-green-100 text-green-600 p-2 rounded-md hover:bg-green-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              
              {/* WhatsApp Order Button */}
              <button 
                className="w-full flex items-center justify-center bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition mb-6"
                onClick={() => {
                  const message = `Hi, I want to order ${quantity} ${product.name} at Rs. ${product.discountPrice || product.price} each.`;
                  window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank');
                }}
              >
                <svg className="w-5 h-5 mr-2" fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                </svg>
                Order via WhatsApp
              </button>
              
              {/* Additional Information Tabs */}
              <div className="border-t pt-6">
                <div className="flex border-b">
                  <button 
                    onClick={() => setActiveTab('description')}
                    className={`px-4 py-2 font-medium ${activeTab === 'description' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'}`}
                  >
                    Description
                  </button>
                  <button 
                    onClick={() => setActiveTab('nutrition')}
                    className={`px-4 py-2 font-medium ${activeTab === 'nutrition' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'}`}
                  >
                    Nutrition Facts
                  </button>
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`px-4 py-2 font-medium ${activeTab === 'reviews' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'}`}
                  >
                    Reviews
                  </button>
                </div>
                
                <div className="py-4">
                  {activeTab === 'description' && (
                    <p className="text-gray-700 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                  
                  {activeTab === 'nutrition' && (
                    <div>
                      {product.nutritionFacts ? (
                        <div className="space-y-2">
                          <div className="flex justify-between py-1 border-b">
                            <span className="font-medium">Calories</span>
                            <span>{product.nutritionFacts.calories}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b">
                            <span className="font-medium">Protein</span>
                            <span>{product.nutritionFacts.protein}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b">
                            <span className="font-medium">Carbohydrates</span>
                            <span>{product.nutritionFacts.carbs}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b">
                            <span className="font-medium">Fiber</span>
                            <span>{product.nutritionFacts.fiber}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b">
                            <span className="font-medium">Vitamin C</span>
                            <span>{product.nutritionFacts.vitaminC}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600">Nutrition information not available for this product.</p>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'reviews' && (
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="flex mr-2">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-gray-600 font-medium">{product.rating} out of 5</span>
                      </div>
                      
                      <p className="text-gray-600">
                        Based on {product.reviewCount || 0} reviews
                      </p>
                      
                      {/* You could add actual reviews here */}
                      {/* This is a placeholder */}
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <span className="font-medium mr-2">Priya S.</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < 5 ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">
                          Incredibly fresh and flavorful! I've been buying these regularly and they're consistently excellent. The organic quality really shows in the taste.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">More from Krishi-Connect</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {fallbackProducts.slice(0, 4).map((relatedProduct) => (
            <div key={relatedProduct._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <Link to={`/product/${relatedProduct._id}`} className="block h-48 overflow-hidden">
                <img
                  src={relatedProduct.image}
                  alt={relatedProduct.name}
                  className="w-full h-full object-cover"
                />
              </Link>
              <div className="p-4">
                <Link to={`/product/${relatedProduct._id}`} className="font-medium hover:text-green-600">
                  {relatedProduct.name}
                </Link>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center">
                    {relatedProduct.discountPrice ? (
                      <>
                        <span className="font-bold">₹{relatedProduct.discountPrice}</span>
                        <span className="text-gray-500 line-through ml-2">₹{relatedProduct.price}</span>
                      </>
                    ) : (
                      <span className="font-bold">₹{relatedProduct.price}</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(relatedProduct);
                      alert(`${relatedProduct.name} added to cart!`);
                    }}
                    className="text-green-600 hover:text-green-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 