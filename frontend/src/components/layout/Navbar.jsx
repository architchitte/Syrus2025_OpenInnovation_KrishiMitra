import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch, FaLeaf, FaBars, FaTimes, FaRobot } from 'react-icons/fa';
import ChatbotDialog from '../chatbot/ChatbotDialog';
import { useCart } from '../../context/CartContext';
import { getUserRole } from '../../utils/authHelpers';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const { user, logout } = useAuth();
  const role = user?.role || getUserRole();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      logout();
    } catch (e) {
      // fallback: clear local storage
      try { localStorage.removeItem('token'); localStorage.removeItem('user'); } catch (err) { /* ignore */ }
    }
    navigate('/login');
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-3' : 'bg-white/90 backdrop-blur-md py-4'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 transition-all hover:scale-105 duration-300">
            <div className="w-10 h-10 rounded-full bg-primary-bg flex items-center justify-center">
              <FaLeaf className="text-2xl text-primary-color" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-dark to-primary-light">KrishiConnect</span>
          </Link>

          {/* Desktop Navigation - role aware */}
          <div className="hidden md:flex items-center space-x-10">
            {/* Landing / common */}
            <Link to="/" className="text-neutral-600 hover:text-primary-color transition-colors relative group py-2">
              Home
            </Link>
            <Link to="/about" className="text-neutral-600 hover:text-primary-color transition-colors relative group py-2">About</Link>
            <Link to="/contact" className="text-neutral-600 hover:text-primary-color transition-colors relative group py-2">Contact</Link>

            {/* Role specific links */}
            {role === 'farmer' ? (
              <>
                <Link to="/dashboard" className="text-neutral-600 hover:text-primary-color transition-colors relative group py-2">Dashboard</Link>
                <Link to="/bulk-buy" className="text-neutral-600 hover:text-primary-color transition-colors relative group py-2">Bulk Buy</Link>
                <Link to="/cold-storage" className="text-neutral-600 hover:text-primary-color transition-colors relative group py-2">Cold Storage</Link>
                <Link to="/crop-recommendation" className="text-neutral-600 hover:text-primary-color transition-colors relative group py-2">AI Crop Guide</Link>
                <Link to="/farmer/orders" className="text-neutral-600 hover:text-primary-color transition-colors relative group py-2">Orders</Link>
              </>
            ) : (
              <>
                <Link to="/products" className="text-neutral-600 hover:text-primary-color transition-colors relative group py-2">Products</Link>
                <Link to="/cart" className="text-neutral-600 hover:text-primary-color transition-colors relative group py-2">Cart</Link>
                <Link to="/my-orders" className="text-neutral-600 hover:text-primary-color transition-colors relative group py-2">My Orders</Link>
              </>
            )}
          </div>

          {/* Right Side Actions */}
            <div className="hidden md:flex items-center space-x-6">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent bg-neutral-50 w-52 transition-all duration-300 focus:w-72 group-hover:shadow-sm"
              />
              <FaSearch className="absolute left-3 top-2.5 text-neutral-400" />
            </div>
            <Link
              to="/cart"
              className="relative text-neutral-600 hover:text-primary-color transition-colors"
            >
              <FaShoppingCart className="text-xl hover:scale-110 transition-transform duration-300" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-color text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-fade-in">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/profile" className="text-neutral-600 hover:text-primary-color transition-colors">
              <FaUser className="text-xl hover:scale-110 transition-transform duration-300" />
            </Link>
            <button
              onClick={() => setShowChatbot(true)}
              className="bg-gradient-to-r from-primary-color to-primary-light text-white p-2.5 rounded-full hover:shadow-md transition-all duration-300 hover:scale-110"
              aria-label="Open AI Assistant"
            >
              <FaRobot className="text-xl" />
            </button>
            {/* Logout button when authenticated */}
            {user && (
              <button
                onClick={handleLogout}
                className="ml-2 text-sm text-red-600 hover:text-red-800"
                aria-label="Logout"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-neutral-600 hover:text-primary-color focus:outline-none p-2 rounded-lg"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {/* Mobile role-aware links */}
            {role === 'farmer' ? (
              <>
                <Link to="/dashboard" className="block px-4 py-3 text-neutral-600 hover:text-primary-color hover:bg-neutral-50 rounded-lg transition-colors">Dashboard</Link>
                <Link to="/bulk-buy" className="block px-4 py-3 text-neutral-600 hover:text-primary-color hover:bg-neutral-50 rounded-lg transition-colors">Bulk Buy</Link>
                <Link to="/cold-storage" className="block px-4 py-3 text-neutral-600 hover:text-primary-color hover:bg-neutral-50 rounded-lg transition-colors">Cold Storage</Link>
                <Link to="/crop-recommendation" className="block px-4 py-3 text-neutral-600 hover:text-primary-color hover:bg-neutral-50 rounded-lg transition-colors">AI Crop Guide</Link>
                <Link to="/farmer/orders" className="block px-4 py-3 text-neutral-600 hover:text-primary-color hover:bg-neutral-50 rounded-lg transition-colors">Orders</Link>
              </>
            ) : (
              <>
                <Link to="/products" className="block px-4 py-3 text-neutral-600 hover:text-primary-color hover:bg-neutral-50 rounded-lg transition-colors">Products</Link>
                <Link to="/my-orders" className="block px-4 py-3 text-neutral-600 hover:text-primary-color hover:bg-neutral-50 rounded-lg transition-colors">My Orders</Link>
                <Link to="/cart" className="block px-4 py-3 text-neutral-600 hover:text-primary-color hover:bg-neutral-50 rounded-lg transition-colors">Cart</Link>
              </>
            )}
            <Link
              to="/about"
              className="block px-4 py-3 text-neutral-600 hover:text-primary-color hover:bg-neutral-50 rounded-lg transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block px-4 py-3 text-neutral-600 hover:text-primary-color hover:bg-neutral-50 rounded-lg transition-colors"
            >
              Contact
            </Link>
            <div className="px-4 py-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent bg-neutral-50"
                />
                <FaSearch className="absolute left-3 top-4 text-neutral-400" />
              </div>
            </div>
            <div className="flex items-center space-x-5 px-4 py-3 border-t border-neutral-100 pt-4">
              <Link
                to="/cart"
                className="relative text-neutral-600 hover:text-primary-color transition-colors"
              >
                <FaShoppingCart className="text-xl" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-color text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="text-neutral-600 hover:text-primary-color transition-colors">
                <FaUser className="text-xl" />
              </Link>
              {user ? (
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              ) : (
                <Link to="/login" className="text-neutral-600 hover:text-primary-color">Login</Link>
              )}
              <button
                onClick={() => setShowChatbot(true)}
                className="bg-gradient-to-r from-primary-color to-primary-light text-white p-2.5 rounded-full hover:shadow-md transition-all duration-300"
                aria-label="Open AI Assistant"
              >
                <FaRobot className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Dialog */}
      {showChatbot && <ChatbotDialog onClose={() => setShowChatbot(false)} />}
    </nav>
  );
};

export default Navbar; 