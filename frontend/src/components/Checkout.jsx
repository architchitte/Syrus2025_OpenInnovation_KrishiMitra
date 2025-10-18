import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api';
import Navbar from './layout/Navbar';
import { getCartItems, calculateCart, clearCart } from '../utils/cartUtils';


const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: ''
  });
  
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  useEffect(() => {
    // Get user data if logged in
    if (token) {
      api.get('/users/profile')
        .then(response => {
          const userData = response.data;
          setFormData(prevState => ({
            ...prevState,
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address?.street || '',
            city: userData.address?.city || '',
            state: userData.address?.state || '',
            pincode: userData.address?.pincode || '',
          }));
        })
        .catch(err => {
          console.error('Error fetching user data:', err);
        });
    }
    
    // Load cart items
    const localCart = getCartItems();
    setCartItems(localCart);
    setLoading(false);
    
    // If no items in cart, redirect to cart page
    if (localCart.length === 0) {
      navigate('/cart');
    }
  }, [token, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate form
      if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Create order data
      const orderData = {
        shippingInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.pincode
        },
        products: cartItems.map(item => ({
          productId: typeof item.productId === 'object' ? item.productId._id : item.productId,
          quantity: item.quantity,
          price: typeof item.productId === 'object' ? 
            (item.productId.discountPrice || item.productId.price) : 0
        })),
        totalAmount: calculateTotal(),
        paymentMethod,
        notes: formData.notes,
        userId: userId || 'guest'
      };
      
      // Submit order
      let response;
      if (token) {
        // Send to API
        response = await api.post('/orders', orderData);
      } else {
        // Store locally and show success (normally would use API)
        // This is a fallback for non-logged in users
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        response = { data: { _id: 'local-' + Date.now() }};
      }
      
      // Clear cart after order
      clearCart();
      
      // Show success
      setOrderPlaced(true);
      setOrderId(response.data._id);
      
    } catch (error) {
      console.error('Error placing order:', error);
      setError('There was a problem placing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }
  
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
              <p className="text-gray-600">Thank you for your order. We've received your request and will process it shortly.</p>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-md inline-block">
                <p className="text-sm text-gray-700">Order ID: <span className="font-medium">{orderId}</span></p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Next Steps</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 bg-green-100 rounded-full mr-3">
                    <span className="text-green-600 text-sm font-medium">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Order Confirmation</h3>
                    <p className="text-sm text-gray-600">We've sent a confirmation to your email address.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 bg-green-100 rounded-full mr-3">
                    <span className="text-green-600 text-sm font-medium">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Order Processing</h3>
                    <p className="text-sm text-gray-600">Your order will be processed and packed by our farmers.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 bg-green-100 rounded-full mr-3">
                    <span className="text-green-600 text-sm font-medium">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Delivery</h3>
                    <p className="text-sm text-gray-600">Your fresh produce will be delivered to your doorstep soon.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <Link to="/" className="flex-1 bg-green-600 text-white text-center py-3 px-4 rounded-md hover:bg-green-700">
                Continue Shopping
              </Link>
              <Link to="/orders" className="flex-1 bg-white border border-gray-300 text-gray-700 text-center py-3 px-4 rounded-md hover:bg-gray-50">
                View My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <Link to="/cart" className="text-green-600 hover:text-green-700">
            Back to Cart
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">Shipping Information</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="Special instructions for delivery"
                    ></textarea>
                  </div>
                </div>
                
                <h2 className="text-lg font-bold mb-4">Payment Method</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                      Cash on Delivery
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="upi"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <label htmlFor="upi" className="ml-3 block text-sm font-medium text-gray-700">
                      UPI / Mobile Payments
                    </label>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700 transition"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              
              <div className="max-h-64 overflow-y-auto mb-6">
                {cartItems.map((item) => {
                  const product = item.productId;
                  if (!product) return null;
                  
                  const productName = typeof product === 'object' ? product.name : 'Product';
                  const productPrice = typeof product === 'object' ? (product.discountPrice || product.price) : 0;
                  
                  return (
                    <div key={typeof product === 'object' ? product._id : item.id} className="flex items-center py-3 border-b">
                      <span className="flex-grow text-sm">{productName} × {item.quantity}</span>
                      <span className="font-medium">₹{(productPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{calculateSubtotal() > 500 ? 'Free' : '₹40.00'}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Including GST
                  </div>
                </div>
              </div>
              
              <div className="border-t border-dashed pt-4">
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  100% secure payment
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Direct from farmers
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Delivery within 2-3 days
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 