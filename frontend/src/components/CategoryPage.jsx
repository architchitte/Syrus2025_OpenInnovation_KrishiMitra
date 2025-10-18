import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api';
import Navbar from './layout/Navbar';
import { addToCart } from '../utils/cartUtils';

// use centralized api client

// Fallback product data for when API is unavailable
const fallbackProductsByCategory = {
  'fruits-vegetables': [
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
      _id: '10',
      name: 'Fresh Carrots',
      description: 'Crunchy and nutritious carrots directly from the farm',
      price: 25,
      category: 'Fruits & Vegetables',
      image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?q=80&w=2142',
      stock: 45,
      isOrganic: true
    }
  ],
  'dairy': [
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
      _id: '11',
      name: 'Organic Paneer',
      description: 'Soft and fresh homemade cottage cheese',
      price: 120,
      discountPrice: 100,
      category: 'Dairy Products',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=2070',
      stock: 15,
      isOrganic: true
    },
    {
      _id: '12',
      name: 'Desi Ghee',
      description: 'Pure cow ghee made using traditional methods',
      price: 550,
      category: 'Dairy Products',
      image: 'https://images.unsplash.com/photo-1589642034453-a52a1e808f4d?q=80&w=2071',
      stock: 25,
      isOrganic: true
    }
  ],
  'grains-cereals': [
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
      _id: '13',
      name: 'Organic Quinoa',
      description: 'Nutrient-rich ancient grain, perfect for salads and bowls',
      price: 180,
      category: 'Grains & Cereals',
      image: 'https://images.unsplash.com/photo-1598964356826-50acad2b1ef2?q=80&w=2076',
      stock: 30,
      isOrganic: true
    }
  ],
  'spices-herbs': [
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
      _id: '14',
      name: 'Red Chili Powder',
      description: 'Freshly ground red chili powder with rich flavor',
      price: 60,
      category: 'Spices & Herbs',
      image: 'https://images.unsplash.com/photo-1563100463-0d62238ebc97?q=80&w=2070',
      stock: 35,
      isOrganic: false
    },
    {
      _id: '15',
      name: 'Coriander Seeds',
      description: 'Aromatic coriander seeds for authentic Indian cooking',
      price: 45,
      category: 'Spices & Herbs',
      image: 'https://images.unsplash.com/photo-1599909366516-6c1a9ee393a6?q=80&w=2070',
      stock: 50,
      isOrganic: true
    }
  ]
};

// Additional products for each category to enhance variety
const additionalProducts = {
  'fruits-vegetables': [
    {
      _id: '16',
      name: 'Organic Bananas',
      description: 'Sweet and nutritious bananas grown organically',
      price: 60,
      discountPrice: 55,
      category: 'Fruits & Vegetables',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=2080',
      stock: 40,
      isOrganic: true
    },
    {
      _id: '17',
      name: 'Fresh Cucumbers',
      description: 'Crisp and refreshing cucumbers perfect for salads',
      price: 35,
      category: 'Fruits & Vegetables',
      image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?q=80&w=2067',
      stock: 25,
      isOrganic: true
    },
    {
      _id: '18',
      name: 'Green Bell Peppers',
      description: 'Vibrant green peppers, great for stir-fries and salads',
      price: 40,
      category: 'Fruits & Vegetables',
      image: 'https://images.unsplash.com/photo-1518568403628-df55701ade9e?q=80&w=1780',
      stock: 30,
      isOrganic: false
    }
  ],
  'dairy': [
    {
      _id: '19',
      name: 'Natural Yogurt',
      description: 'Creamy and probiotic-rich yogurt made from farm-fresh milk',
      price: 90,
      discountPrice: 80,
      category: 'Dairy Products',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1887',
      stock: 20,
      isOrganic: true
    },
    {
      _id: '20',
      name: 'Artisanal Cheese',
      description: 'Handcrafted cheese aged to perfection',
      price: 250,
      category: 'Dairy Products',
      image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=2073',
      stock: 15,
      isOrganic: false
    }
  ],
  'grains-cereals': [
    {
      _id: '21',
      name: 'Organic Oats',
      description: 'Whole grain rolled oats perfect for breakfast',
      price: 75,
      category: 'Grains & Cereals',
      image: 'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?q=80&w=2070',
      stock: 45,
      isOrganic: true
    },
    {
      _id: '22',
      name: 'Brown Rice',
      description: 'Nutritious whole grain brown rice',
      price: 95,
      discountPrice: 85,
      category: 'Grains & Cereals',
      image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=2070',
      stock: 50,
      isOrganic: true
    }
  ],
  'spices-herbs': [
    {
      _id: '23',
      name: 'Cumin Seeds',
      description: 'Aromatic cumin seeds for Indian and Middle Eastern cooking',
      price: 65,
      category: 'Spices & Herbs',
      image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=2075',
      stock: 30,
      isOrganic: false
    },
    {
      _id: '24',
      name: 'Fresh Basil',
      description: 'Fragrant basil leaves, harvested daily',
      price: 40,
      category: 'Spices & Herbs',
      image: 'https://images.unsplash.com/photo-1600788886242-5c96aabe3757?q=80&w=2069',
      stock: 20,
      isOrganic: true
    }
  ]
};

// Merge additional products into fallback products
Object.keys(additionalProducts).forEach(category => {
  if (fallbackProductsByCategory[category]) {
    fallbackProductsByCategory[category] = [
      ...fallbackProductsByCategory[category],
      ...additionalProducts[category]
    ];
  }
});

// Category name mapping
const categoryMapping = {
  'fruits-vegetables': 'Fruits & Vegetables',
  'dairy': 'Dairy Products',
  'grains-cereals': 'Grains & Cereals',
  'spices-herbs': 'Spices & Herbs'
};

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('');
  const [filterOption, setFilterOption] = useState('');
  
  const formattedCategoryName = categoryMapping[categoryName] || '';

  useEffect(() => {
    fetchProductsByCategory();
  }, [categoryName]);

  const fetchProductsByCategory = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, always use the fallback data
      const fallbackData = fallbackProductsByCategory[categoryName] || [];
      
      try {
        // Attempt to get data from API
        const response = await api.get('/products', {
          params: { category: formattedCategoryName }
        });
        
        // If API returns data, use it, otherwise use fallback
        if (response.data && response.data.length > 0) {
          setProducts(response.data);
        } else {
          setProducts(fallbackData);
        }
      } catch (apiError) {
        console.log('Using fallback data due to API error');
        setProducts(fallbackData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchProductsByCategory:', error);
      setError('Failed to load products. Please try again later.');
      // Ensure fallback data is used even in case of any error
      const fallbackData = fallbackProductsByCategory[categoryName] || [];
      setProducts(fallbackData);
      setLoading(false);
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault(); // Prevent navigation when clicking the cart button
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  const getSortedAndFilteredProducts = () => {
    let filteredProducts = [...products];
    
    // Apply filter
    if (filterOption === 'organic') {
      filteredProducts = filteredProducts.filter(product => product.isOrganic);
    } else if (filterOption === 'discounted') {
      filteredProducts = filteredProducts.filter(product => product.discountPrice);
    }
    
    // Apply sorting
    if (sortOption === 'price-asc') {
      filteredProducts.sort((a, b) => {
        const priceA = a.discountPrice || a.price;
        const priceB = b.discountPrice || b.price;
        return priceA - priceB;
      });
    } else if (sortOption === 'price-desc') {
      filteredProducts.sort((a, b) => {
        const priceA = a.discountPrice || a.price;
        const priceB = b.discountPrice || b.price;
        return priceB - priceA;
      });
    } else if (sortOption === 'name-asc') {
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'name-desc') {
      filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    return filteredProducts;
  };

  const displayedProducts = getSortedAndFilteredProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="text-sm text-gray-500">
            <Link to="/" className="hover:text-green-600">Home</Link> {' > '}
            <span className="text-gray-700">{formattedCategoryName}</span>
          </div>
        </div>
        
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{formattedCategoryName}</h1>
          <p className="text-gray-600 mt-2">
            Fresh and high-quality {formattedCategoryName.toLowerCase()} sourced directly from farmers
          </p>
        </div>
        
        {/* Filter and Sort Controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
                <select 
                  className="border border-gray-300 rounded-md p-2 w-full"
                  value={filterOption}
                  onChange={(e) => setFilterOption(e.target.value)}
                >
                  <option value="">All Products</option>
                  <option value="organic">Organic Only</option>
                  <option value="discounted">On Sale</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select 
                  className="border border-gray-300 rounded-md p-2 w-full"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-end">
              <p className="text-gray-600">{displayedProducts.length} products found</p>
            </div>
          </div>
        </div>
        
        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="bg-yellow-50 text-yellow-700 p-8 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">No products found</h2>
            <p>Try adjusting your filters or check back later for new arrivals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <Link to={`/product/${product._id}`} className="block h-48 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/product/${product._id}`} className="font-medium hover:text-green-600">
                      {product.name}
                    </Link>
                    {product.isOrganic && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Organic
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {product.discountPrice ? (
                        <>
                          <span className="font-bold text-lg">₹{product.discountPrice}</span>
                          <span className="text-gray-500 line-through ml-2">₹{product.price}</span>
                        </>
                      ) : (
                        <span className="font-bold text-lg">₹{product.price}</span>
                      )}
                    </div>
                    <button 
                      onClick={(e) => handleAddToCart(e, product)}
                      className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage; 