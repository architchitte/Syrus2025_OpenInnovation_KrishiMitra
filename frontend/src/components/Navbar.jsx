import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart } from '../utils/cartApi';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const { user: ctxUser, logout } = useAuth();

  useEffect(() => {
    // Update cart count
    const updateCartCount = async () => {
      if (isAuthenticated) {
        try {
          const cartItems = await getCart();
          setCartCount(cartItems.length);
        } catch (error) {
          console.error('Error fetching cart count:', error);
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    // Initial cart count
    updateCartCount();

    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartCount);

    // Get user info if logged in
    if (token) {
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userInfo);
    }

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, [token, isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <>
      {/* Header with navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-green-700">Krishi-Connect</Link>
              <div className="text-sm text-gray-500">
                Connecting Farmers & Consumers
              </div>
            </div>
            
            <div className="relative flex-grow max-w-2xl mx-4">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search for products, categories or brands..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </button>
              </form>
            </div>
            
            <div className="flex items-center space-x-6">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="flex items-center text-green-600 hover:text-green-800">
                    <span className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold mr-2">
                      {user.name?.charAt(0)}
                    </span>
                    <span className="text-sm">Hello, {user.name}</span>
                  </Link>
                  <button 
                    onClick={() => {
                      try { logout(); } catch (e) { try { localStorage.removeItem('token'); localStorage.removeItem('user'); } catch (_) {} }
                      navigate('/login');
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="text-green-600 hover:text-green-800"
                >
                  Login
                </Link>
              )}
              
              <Link to="/cart" className="flex items-center relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 hover:text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation menu */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 py-4 overflow-x-auto">
            <Link to="/" className="text-gray-800 hover:text-green-600 whitespace-nowrap">Home</Link>
            <Link to="/category/fruits-vegetables" className="text-gray-800 hover:text-green-600 whitespace-nowrap">Fruits & Vegetables</Link>
            <Link to="/category/dairy" className="text-gray-800 hover:text-green-600 whitespace-nowrap">Dairy Products</Link>
            <Link to="/category/grains-cereals" className="text-gray-800 hover:text-green-600 whitespace-nowrap">Grains & Cereals</Link>
            <Link to="/category/spices-herbs" className="text-gray-800 hover:text-green-600 whitespace-nowrap">Spices & Herbs</Link>
            <Link to="/blog" className="text-gray-800 hover:text-green-600 whitespace-nowrap">Farming Blog</Link>
            <Link to="/support" className="text-gray-800 hover:text-green-600 whitespace-nowrap">Support</Link>
            <Link to="/about" className="text-gray-800 hover:text-green-600 whitespace-nowrap">About Us</Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar; 