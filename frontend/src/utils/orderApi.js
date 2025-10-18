import axios from 'axios';
import { getToken } from './authApi';

const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// Get user orders
export const getUserOrders = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await axios.get(`${API_URL}/orders/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch orders' };
  }
};

// Get order details
export const getOrderDetails = async (orderId) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await axios.get(`${API_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch order details' };
  }
};

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await axios.post(`${API_URL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create order' };
  }
}; 