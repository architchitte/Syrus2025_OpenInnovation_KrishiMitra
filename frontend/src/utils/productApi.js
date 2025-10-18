import axios from 'axios';
import { sampleProducts } from './sampleProducts';

const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export const getAllProducts = async () => {
  try {
    // For development, return sample data
    return sampleProducts;
    
    // When backend is ready, uncomment this:
    // const response = await axios.get(`${API_URL}/products`);
    // return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch products';
  }
};

export const getProductById = async (id) => {
  try {
    // For development, return sample data
    const product = sampleProducts.find(p => p._id === id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
    
    // When backend is ready, uncomment this:
    // const response = await axios.get(`${API_URL}/products/${id}`);
    // return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch product details';
  }
};

export const bulkUploadProducts = async (products) => {
  try {
    const response = await axios.post(`${API_URL}/products/bulk`, products);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to upload products';
  }
}; 