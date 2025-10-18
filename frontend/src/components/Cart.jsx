import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getLocalCart, updateLocalCartQuantity, removeFromLocalCart } from '../utils/cartUtils';
import api from '../utils/api';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      // Get cart from localStorage first
      const localCart = getLocalCart();
      
      if (token) {
        // If authenticated, try to fetch from API
        try {
          const response = await api.get('/users/cart');
          setCartItems(response.data);
        } catch (error) {
          console.error('Error fetching cart from API:', error);
          // Fallback to localStorage
          setCartItems(localCart);
        }
      } else {
        // Not authenticated, use localStorage
        setCartItems(localCart);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load your cart. Please try again.');
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        return removeFromCart(productId);
      }

      // Update local state first for immediate feedback
      const updatedItems = cartItems.map(item => {
        const itemId = item.productId._id || item.productId;
        return (itemId === productId) ? { ...item, quantity: newQuantity } : item;
      });
      
      setCartItems(updatedItems);

      // Update in local storage
      updateLocalCartQuantity(productId, newQuantity);

      // Update on server if authenticated
      if (token) {
        await api.put(`/users/cart/${productId}`, { quantity: newQuantity });
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Failed to update quantity. Please try again.');
      // Refresh cart to sync with stored state
      fetchCart();
    }
  };

  const removeFromCart = async (productId) => {
    try {
      // Update local state first
      const updatedItems = cartItems.filter(item => {
        const itemId = item.productId._id || item.productId;
        return itemId !== productId;
      });
      
      setCartItems(updatedItems);

      // Update in local storage
      removeFromLocalCart(productId);

      // Update on server if authenticated
      if (token) {
        await api.delete(`/users/cart/${productId}`);
      }
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item. Please try again.');
      // Refresh cart to sync with stored state
      fetchCart();
    }
  };

  const handleCouponApply = () => {
    if (couponCode.toUpperCase() === 'KRISHI10') {
      setDiscountApplied(true);
      setDiscountAmount(calculateSubtotal() * 0.1); // 10% discount
    } else if (couponCode.toUpperCase() === 'CONNECT20') {
      setDiscountApplied(true);
      setDiscountAmount(calculateSubtotal() * 0.2); // 20% discount
    } else {
      setError('Invalid coupon code');
      setTimeout(() => setError(null), 3000);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const product = item.productId;
      if (!product) return total;
      
      const price = typeof product === 'object' 
        ? (product.discountPrice || product.price)
        : 0;
        
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shippingFee = subtotal > 500 ? 0 : 40; // Free shipping over ₹500
    return subtotal + shippingFee - discountAmount;
  };

  const handleCheckout = () => {
    if (!token) {
      setError('Please login to proceed with checkout');
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      setTimeout(() => setError(null), 3000);
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <Link to="/" className="text-green-600 hover:text-green-700">
            Continue Shopping
          </Link>
        </div>

        {error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link
              to="/"
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="divide-y">
                  {cartItems.map((item, index) => {
                    const product = item.productId;
                    // Skip rendering if product is invalid
                    if (!product) return null;
                    
                    const productId = typeof product === 'object' ? product._id : product;
                    const productName = typeof product === 'object' ? product.name : 'Product';
                    const productImage = typeof product === 'object' ? product.image : 'https://via.placeholder.com/100';
                    const productCategory = typeof product === 'object' ? product.category : '';
                    const productPrice = typeof product === 'object' ? product.price : 0;
                    const productDiscountPrice = typeof product === 'object' ? product.discountPrice : null;
                    
                    return (
                      <div key={productId || index} className="p-4">
                        <div className="flex items-center">
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="ml-4 flex-grow">
                            <Link
                              to={`/product/${productId}`}
                              className="font-medium hover:text-green-600"
                            >
                              {productName}
                            </Link>
                            <div className="text-sm text-gray-500">
                              {productCategory}
                            </div>
                            <div className="mt-1">
                              {productDiscountPrice ? (
                                <>
                                  <span className="font-bold">
                                    ₹{productDiscountPrice}
                                  </span>
                                  <span className="text-gray-500 line-through ml-2">
                                    ₹{productPrice}
                                  </span>
                                </>
                              ) : (
                                <span className="font-bold">
                                  ₹{productPrice}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex border border-gray-300 rounded-md">
                              <button
                                onClick={() => updateQuantity(productId, item.quantity - 1)}
                                className="px-3 py-1 hover:bg-gray-100"
                              >
                                −
                              </button>
                              <span className="px-3 py-1">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(productId, item.quantity + 1)}
                                className="px-3 py-1 hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(productId)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                {/* Coupon Code */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <button
                      onClick={handleCouponApply}
                      disabled={discountApplied}
                      className={`px-4 py-2 rounded-md ${
                        discountApplied
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{calculateSubtotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{calculateSubtotal() > 500 ? 'Free' : '₹40'}</span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 font-semibold">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span>₹{calculateTotal()}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 