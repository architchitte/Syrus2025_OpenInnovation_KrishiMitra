import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

/**
 * Get cart items from server
 * @returns {Promise} - Promise that resolves with cart items
 */
export const getCart = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(`${API_URL}/users/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching cart from server:', error);
    throw error;
  }
};

/**
 * Add product to cart
 * @param {String} productId - The product ID to add
 * @param {Number} quantity - Quantity to add (default: 1)
 * @returns {Promise} - Promise that resolves with updated cart
 */
export const addToCart = async (productId, quantity = 1) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.post(
      `${API_URL}/users/cart`,
      { productId, quantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('cartUpdated'));
    
    return response.data;
  } catch (error) {
    console.error('Error adding product to cart:', error);
    throw error;
  }
};

/**
 * Update product quantity in cart
 * @param {String} productId - The product ID to update
 * @param {Number} quantity - New quantity
 * @returns {Promise} - Promise that resolves with updated cart
 */
export const updateCartQuantity = async (productId, quantity) => {
  try {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.put(
      `${API_URL}/users/cart/${productId}`,
      { quantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('cartUpdated'));
    
    return response.data;
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    throw error;
  }
};

/**
 * Remove product from cart
 * @param {String} productId - The product ID to remove
 * @returns {Promise} - Promise that resolves with updated cart
 */
export const removeFromCart = async (productId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.delete(
      `${API_URL}/users/cart/${productId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('cartUpdated'));
    
    return response.data;
  } catch (error) {
    console.error('Error removing product from cart:', error);
    throw error;
  }
};

/**
 * Clear all items from cart
 * @returns {Promise} - Promise that resolves with empty cart
 */
export const clearCart = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // This API endpoint might need to be implemented on the backend
    const response = await axios.delete(
      `${API_URL}/users/cart`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('cartUpdated'));
    
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

/**
 * Get cart count
 * @returns {Promise} - Promise that resolves with cart count
 */
export const getCartCount = async () => {
  try {
    const cartItems = await getCart();
    return cartItems.length;
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
};

/**
 * Calculate cart total
 * @returns {Promise} - Promise that resolves with cart total
 */
export const getCartTotal = async () => {
  try {
    const cartItems = await getCart();
    
    return cartItems.reduce((total, item) => {
      const price = (item.productId && item.productId.price) || 0;
      return total + (price * item.quantity);
    }, 0);
  } catch (error) {
    console.error('Error calculating cart total:', error);
    return 0;
  }
}; 