import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import { getCart, updateCartQuantity, removeFromCart } from '../../utils/cartApi';
import './Cart.css';

// Using centralized cart API utilities which themselves use the configured API base

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        // Use MongoDB cart for authenticated users
        const items = await getCart();
        setCartItems(items);
      } else {
        // Redirect to login if not authenticated
        setError('Please log in to view your cart');
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart. Please try again or log in.');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      if (isAuthenticated) {
        // Update UI optimistically
        const updatedItems = cartItems.map(item => 
          item.productId._id === productId ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedItems);
        
        // Update in MongoDB
        await updateCartQuantity(productId, newQuantity);
        setSuccess('Cart updated successfully');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError('Please log in to update your cart');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Failed to update quantity. Please try again.');
      setTimeout(() => setError(''), 3000);
      // Refresh cart to sync with server state
      fetchCartItems();
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      if (isAuthenticated) {
        // Update UI optimistically
        const updatedItems = cartItems.filter(item => item.productId._id !== productId);
        setCartItems(updatedItems);
        
        // Remove from MongoDB
        await removeFromCart(productId);
        
        setSuccess('Item removed from cart');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError('Please log in to update your cart');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item. Please try again.');
      setTimeout(() => setError(''), 3000);
      // Refresh cart to sync with server state
      fetchCartItems();
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setError('Please log in to proceed to checkout');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Navigate to checkout page
    navigate('/checkout');
  };

  const applyCoupon = () => {
    // Simple coupon validation for demo
    if (couponCode.toUpperCase() === 'KRISHI10') {
      setDiscount(10);
      setSuccess('Coupon applied successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } else if (couponCode.toUpperCase() === 'ORGANIC20') {
      setDiscount(20);
      setSuccess('Coupon applied successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError('Invalid coupon code');
      setTimeout(() => setError(''), 3000);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.productId?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = subtotal * (discount / 100);
    return subtotal - discountAmount;
  };

  return (
    <div className="cart-page">
      <Navbar />
      <div className="cart-container">
        <h1>Your Cart</h1>
        
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : !isAuthenticated ? (
          <div className="empty-cart">
            <i className="fas fa-user-lock empty-cart-icon"></i>
            <h2>Authentication Required</h2>
            <p>Please log in to view and manage your cart.</p>
            <Link to="/login" className="continue-shopping-btn">Log In</Link>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="empty-cart">
            <i className="fas fa-shopping-cart empty-cart-icon"></i>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/" className="continue-shopping-btn">Continue Shopping</Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.productId._id} className="cart-item">
                  <div className="item-image">
                    <img src={item.productId.image} alt={item.productId.name} />
                  </div>
                  <div className="item-details">
                    <h3>{item.productId.name}</h3>
                    <p className="item-price">₹{item.productId.price}</p>
                    {item.productId.isOrganic && <span className="organic-badge">Organic</span>}
                  </div>
                  <div className="item-quantity">
                    <button 
                      onClick={() => handleQuantityChange(item.productId._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.productId._id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <div className="item-total">
                    ₹{item.productId.price * item.quantity}
                  </div>
                  <button 
                    className="remove-item" 
                    onClick={() => handleRemoveItem(item.productId._id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{calculateSubtotal()}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount ({discount}%):</span>
                  <span>-₹{(calculateSubtotal() * (discount / 100)).toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{calculateTotal()}</span>
              </div>
              
              <div className="coupon-section">
                <h3>Apply Coupon</h3>
                <div className="coupon-input">
                  <input 
                    type="text" 
                    placeholder="Enter coupon code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button onClick={applyCoupon}>Apply</button>
                </div>
                {success && <div className="success-message">{success}</div>}
                {error && <div className="error-message">{error}</div>}
                <div className="available-coupons">
                  <p>Available Coupons:</p>
                  <ul>
                    <li>KRISHI10 - 10% off on all products</li>
                    <li>ORGANIC20 - 20% off on organic products</li>
                  </ul>
                </div>
              </div>
              
              <button className="checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>
              <Link to="/" className="continue-shopping">Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart; 