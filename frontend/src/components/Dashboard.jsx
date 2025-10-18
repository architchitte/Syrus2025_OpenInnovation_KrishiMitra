import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './layout/Navbar';
import { addToCart } from '../utils/cartApi';
import api from '../utils/api';
import { fetchProductImages, fetchFarmerImages } from '../utils/imageApi';
import FarmingAssistant from './chatbot/FarmingAssistant';
import ChatbotButton from './chatbot/ChatbotButton';

// use centralized api client

// Fallback product data for when API is unavailable
const fallbackProducts = [
  {
    _id: '1',
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
    _id: '2',
    name: 'Fresh Spinach',
    description: 'Locally grown spinach, perfect for salads and cooking',
    price: 30,
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=2432',
    stock: 30,
    isOrganic: true
  },
  {
    _id: '3',
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
    _id: '4',
    name: 'Farm Fresh Milk',
    description: 'Fresh cow milk delivered daily',
    price: 50,
    category: 'Dairy Products',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=2070',
    stock: 20,
    isOrganic: true
  },
  {
    _id: '5',
    name: 'Turmeric Powder',
    description: 'Organic turmeric powder for cooking and health benefits',
    price: 80,
    category: 'Spices & Herbs',
    image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f1?q=80&w=2070',
    stock: 40,
    isOrganic: true
  },
  {
    _id: '6',
    name: 'Organic Apples',
    description: 'Sweet and crisp apples from organic orchards',
    price: 70,
    discountPrice: 65,
    category: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=2070',
    stock: 60,
    isOrganic: true
  },
  {
    _id: '7',
    name: 'Basmati Rice',
    description: 'Premium long-grain basmati rice',
    price: 120,
    category: 'Grains & Cereals',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?q=80&w=2070',
    stock: 50,
    isOrganic: false
  },
  {
    _id: '8',
    name: 'Organic Honey',
    description: 'Pure unfiltered honey from local beekeepers',
    price: 150,
    category: 'Dairy Products',
    image: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?q=80&w=2080',
    stock: 25,
    isOrganic: true
  }
];

// Fallback categories data
const fallbackCategories = [
  {
    _id: '1',
    name: 'Fruits & Vegetables',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=2070'
  },
  {
    _id: '2',
    name: 'Dairy Products',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=2070'
  },
  {
    _id: '3',
    name: 'Grains & Cereals',
    image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=2142'
  },
  {
    _id: '4',
    name: 'Spices & Herbs',
    image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=2070'
  }
];

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [farmerImages, setFarmerImages] = useState([]);

  // Auth token from localStorage
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    // Function to fetch categories
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Use fallback categories data
        setCategories(fallbackCategories);
      }
    };

    // Function to fetch farmer images from Unsplash
    const loadFarmerImages = async () => {
      try {
        const images = await fetchFarmerImages(3); // Fetch 3 farmer images
        if (images && images.length > 0) {
          setFarmerImages(images);
        }
      } catch (error) {
        console.error('Error fetching farmer images:', error);
      }
    };

    // Function to fetch products
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/products', {
          params: { category: selectedCategory, search: searchTerm }
        });
        setProducts(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        
        // Use the fallback data but apply filtering based on selectedCategory and searchTerm
        let filteredProducts = [...fallbackProducts];
        
        // Apply category filter
        if (selectedCategory) {
          filteredProducts = filteredProducts.filter(
            product => product.category === selectedCategory
          );
        }
        
        // Apply search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filteredProducts = filteredProducts.filter(
            product => 
              product.name.toLowerCase().includes(searchLower) || 
              product.description.toLowerCase().includes(searchLower) ||
              product.category.toLowerCase().includes(searchLower)
          );
        }
        
        setProducts(filteredProducts);
        setIsLoading(false);
      }
    };

    // Add this function to fetch images for each product category
    const fetchImagesForProducts = async () => {
      setIsLoading(true);
      
      // Create copy of fallback products
      const enhancedProducts = [...fallbackProducts];
      
      // Process in batches to avoid rate limiting
      for (let i = 0; i < enhancedProducts.length; i++) {
        const product = enhancedProducts[i];
        try {
          // Fetch image for this product
          const images = await fetchProductImages(product.name, 1);
          if (images && images.length > 0) {
            enhancedProducts[i] = {
              ...product,
              image: images[0].url
            };
          }
        } catch (err) {
          console.error(`Error fetching image for ${product.name}:`, err);
        }
      }
      
      setProducts(enhancedProducts);
      setIsLoading(false);
    };

    fetchCategories();
    
    // If we're not filtering, fetch images for all products
    if (!selectedCategory && !searchTerm) {
      fetchImagesForProducts();
    } else {
      fetchProducts();
    }

    // Load farmer images
    loadFarmerImages();
  }, [selectedCategory, searchTerm]);

  // Function to add item to cart
  const handleAddToCart = async (e, product) => {
    e.preventDefault(); // Prevent navigation when clicking the cart button
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add items to your cart');
      return;
    }
    
    try {
      await addToCart(product._id, 1);
      alert(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.message === 'Authentication required') {
        alert('Please log in to add items to your cart');
      } else {
        alert('Failed to add to cart. Please try again.');
      }
    }
  };

  // Function to filter products by category
  const filterByCategory = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  // Function to handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Apply search filter
      fetchProducts();
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl mb-12">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1498579150354-977475b7ea0b?q=80&w=2070" 
              alt="Farm Landscape" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-green-800/60"></div>
              </div>
          
          <div className="relative py-16 px-8 md:py-24 md:px-12">
            <div className="max-w-3xl">
              <span className="bg-yellow-400 text-yellow-800 px-4 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                #SupportLocalFarmers
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Krishi-Connect: Bridging Farms To Homes</h1>
              <p className="text-xl text-white/90 mb-8">
                Support local farmers and enjoy fresh, seasonal produce at prices that are fair for everyone.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow bg-white/90 backdrop-blur-sm rounded-lg">
                  <form onSubmit={handleSearchSubmit} className="flex p-1">
                    <input
                      type="text"
                      placeholder="Search for fresh produce..."
                      className="flex-grow bg-transparent text-gray-800 outline-none px-4 py-3"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                      Search
                    </button>
                  </form>
                </div>
                
                <a href="#categories" className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-lg hover:bg-white/30 transition">
                  Browse Categories
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  100% Organic
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Same-day Delivery
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  Fair Pricing
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Farmer Spotlight Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Meet Our Farmers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dynamic farmer cards based on API images */}
            {farmerImages.length > 0 ? (
              <>
                <div className="bg-white rounded-xl overflow-hidden shadow-md">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={farmerImages[0]?.url || "https://images.unsplash.com/photo-1582488766472-8772ce613206?q=80&w=2070"} 
                      alt="Farmer Rajesh" 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                    />
                    {farmerImages[0]?.credit && (
                      <a 
                        href={farmerImages[0].credit.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded-full"
                      >
                        Photo: {farmerImages[0].credit.name}
                      </a>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">Rajesh Kumar</h3>
                    <p className="text-gray-600 mb-4">Growing organic vegetables for over 15 years using traditional farming methods.</p>
                    <div className="flex items-center">
                      <span className="text-green-600 font-medium">View Products</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl overflow-hidden shadow-md">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={farmerImages[1]?.url || "https://images.unsplash.com/photo-1527535839613-93e1d8b4d494?q=80&w=2071"} 
                      alt="Farmer Sunita" 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                    />
                    {farmerImages[1]?.credit && (
                      <a 
                        href={farmerImages[1].credit.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded-full"
                      >
                        Photo: {farmerImages[1].credit.name}
                      </a>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">Sunita Patel</h3>
                    <p className="text-gray-600 mb-4">Specializes in dairy products from grass-fed cows raised on her family farm.</p>
                    <div className="flex items-center">
                      <span className="text-green-600 font-medium">View Products</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
            </div>
          </div>
        </div>
                
                <div className="bg-white rounded-xl overflow-hidden shadow-md">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={farmerImages[2]?.url || "https://images.unsplash.com/photo-1619142992302-4a73061a0f8e?q=80&w=2069"} 
                      alt="Farmer Amit" 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                    />
                    {farmerImages[2]?.credit && (
                      <a 
                        href={farmerImages[2].credit.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded-full"
                      >
                        Photo: {farmerImages[2].credit.name}
                      </a>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">Amit Singh</h3>
                    <p className="text-gray-600 mb-4">Third-generation rice farmer practicing sustainable agriculture methods.</p>
                    <div className="flex items-center">
                      <span className="text-green-600 font-medium">View Products</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Loading or fallback state
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="flex items-center">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
        
        {/* Add FarmingAssistant Section after the Farmer Spotlight */}
        <FarmingAssistant />
        
        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div 
                key={category._id}
                className={`relative rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  selectedCategory === category.name ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => filterByCategory(category.name)}
              >
                <div className="relative h-40">
                  <div className="absolute inset-0 bg-black opacity-40"></div>
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white text-xl font-bold text-center">{category.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Special Offers Section */}
        <section className="mb-12 p-6 bg-yellow-50 rounded-xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-yellow-800 mb-2">Special Offers</h2>
              <p className="text-yellow-700 mb-4">Limited time deals on fresh produce</p>
              <div className="flex gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-sm text-gray-500">Ends in</span>
                  <div className="flex gap-2 mt-1">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-mono">12</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-mono">45</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-mono">20</span>
                  </div>
                </div>
                <Link to="/category/fruits-vegetables" className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 flex items-center">
                  Shop Now
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="mt-6 md:mt-0 flex gap-4">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden w-32">
                <div className="h-24 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=2070" alt="Organic Apples" className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium">Organic Apples</p>
                  <div className="flex items-center mt-1">
                    <span className="text-green-600 font-bold">₹65</span>
                    <span className="text-gray-400 text-xs line-through ml-2">₹70</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden w-32">
                <div className="h-24 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=2070" alt="Organic Paneer" className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium">Organic Paneer</p>
                  <div className="flex items-center mt-1">
                    <span className="text-green-600 font-bold">₹100</span>
                    <span className="text-gray-400 text-xs line-through ml-2">₹120</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{selectedCategory || 'Featured Products'}</h2>
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory('')}
                className="text-green-600 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Clear Filter
              </button>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? `No results found for "${searchTerm}"` : 'No products available in this category'}
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                View All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition duration-200">
                  <Link to={`/product/${product._id}`} className="block relative h-48 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
                    />
                    {product.isOrganic && (
                      <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Organic
        </span>
                    )}
                    {product.discountPrice && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
          </span>
                    )}
                  </Link>
                  <div className="p-4">
                    <Link 
                      to={`/product/${product._id}`}
                      className="block font-medium text-gray-800 hover:text-green-600 mb-1 truncate"
                    >
                      {product.name}
                    </Link>
                    <div className="text-sm text-gray-500 mb-2">{product.category}</div>
                    <div className="flex justify-between items-center">
                      <div>
                        {product.discountPrice ? (
                          <>
                            <span className="font-bold text-gray-800">₹{product.discountPrice}</span>
                            <span className="ml-1 text-sm text-gray-500 line-through">₹{product.price}</span>
                          </>
                        ) : (
                          <span className="font-bold text-gray-800">₹{product.price}</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="text-gray-700 hover:text-green-600"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Direct from Farm Section */}
        <section className="mt-16 p-8 bg-green-50 rounded-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Why Choose Krishi-Connect?</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              When you buy directly from farmers, you get fresher, healthier produce while supporting local agriculture
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-green-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Freshness Guaranteed</h3>
              <p className="text-gray-600">
                Products are harvested and delivered within 24 hours, ensuring maximum freshness and nutritional value.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-green-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fair Pricing</h3>
              <p className="text-gray-600">
                By eliminating middlemen, farmers earn more while you pay less for higher quality produce.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-green-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Support Local Farming</h3>
              <p className="text-gray-600">
                Your purchase directly supports local farming communities and sustainable agricultural practices.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="mb-12 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-8 text-center">Why Choose Krishi-Connect?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Directly from Farmers</h3>
              <p className="text-gray-600">
                Buy directly from verified local farmers, eliminating middlemen and ensuring farmers get fair prices for their produce.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Traceability & Transparency</h3>
              <p className="text-gray-600">
                Know exactly where your food comes from and which farmer grew it. Complete transparency from farm to table.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Fresh & Healthy</h3>
              <p className="text-gray-600">
                Our products are harvested and delivered within 24 hours, ensuring you get the freshest and most nutritious food possible.
              </p>
            </div>
          </div>
        </section>

        {/* Customer Testimonials */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">What Our Customers Say</h2>
            <div className="flex gap-2">
              <button className="p-2 bg-gray-100 rounded-full hover:bg-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="p-2 bg-gray-100 rounded-full hover:bg-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xl mr-4">
                  P
                </div>
                <div>
                  <h3 className="font-medium">Priya Sharma</h3>
                  <div className="flex text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                "The organic vegetables I ordered were incredibly fresh - like they were picked the same day. Will definitely continue ordering from FarmFresh!"
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl mr-4">
                  R
                </div>
                <div>
                  <h3 className="font-medium">Rahul Verma</h3>
                  <div className="flex text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                "I love being able to support local farmers directly. The quality is exceptional and the prices are fair. Highly recommend their basmati rice!"
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xl mr-4">
                  A
                </div>
                <div>
                  <h3 className="font-medium">Anita Desai</h3>
                  <div className="flex text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                "The farm-fresh dairy products are amazing! You can really taste the difference. Their ghee and paneer are now staples in my kitchen."
              </p>
            </div>
          </div>
        </section>

        {/* Download App Banner */}
        <section className="mb-12 bg-gradient-to-r from-green-800 to-green-600 rounded-xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center p-8">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Download Our Krishi-Connect App</h2>
              <p className="text-white text-opacity-90 mb-6">
                Get exclusive deals, track your orders, and shop faster with our mobile app.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="bg-black text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.707 9.293l-5-5a.999.999 0 10-1.414 1.414L14.586 9H3a1 1 0 100 2h11.586l-2.293-2.293a1 1 0 010-1.414z" />
                  </svg>
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-medium">App Store</div>
                  </div>
                </a>
                <a href="#" className="bg-black text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.707 9.293l-5-5a.999.999 0 10-1.414 1.414L14.586 9H3a1 1 0 100 2h11.586l-2.293-2.293a1 1 0 010-1.414z" />
                  </svg>
                  <div>
                    <div className="text-xs">GET IT ON</div>
                    <div className="text-lg font-medium">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=2074" 
                alt="Mobile App" 
                className="h-48 md:h-64 rounded-lg shadow-lg object-cover"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Krishi-Connect</h3>
              <p className="text-green-200">
                Connecting farmers directly with consumers for the freshest produce at fair prices.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-green-200 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-green-200 hover:text-white">How It Works</a></li>
                <li><a href="#" className="text-green-200 hover:text-white">For Farmers</a></li>
                <li><a href="#" className="text-green-200 hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Newsletter</h3>
              <p className="text-green-200 mb-2">
                Subscribe to get updates on new products and seasonal offers.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-green-700 text-white px-3 py-2 rounded-l outline-none flex-grow"
                />
                <button className="bg-green-600 text-white px-4 py-2 rounded-r">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-green-700 mt-8 pt-6 text-center text-green-200">
            <p>&copy; 2023 Krishi-Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Add Chatbot Button */}
      <ChatbotButton />
    </div>
  );
};

export default Dashboard;
