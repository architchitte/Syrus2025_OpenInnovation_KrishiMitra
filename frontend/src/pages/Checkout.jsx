import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import CartSummary from '../components/checkout/CartSummary';
import CheckoutForm from '../components/checkout/CheckoutForm';
import { GiWheat } from 'react-icons/gi';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Delivery address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    
    setIsSubmitting(true);

    try {
      console.log('Cart items:', cart); // Add this for debugging
      
      const formattedItems = cart.map(item => {
        // Validate seller information
        if (!item.seller || !item.seller._id) {
          console.error('Invalid seller information for item:', item);
          throw new Error(`Missing or invalid seller information for product: ${item.name}`);
        }
        
        return {
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          farmerId: item.seller._id
        };
      });

      const orderData = {
        customerInfo: formData,
        items: formattedItems,
        totalAmount: getCartTotal(),
        paymentMethod: 'simulated'
      };

      console.log('Submitting order data:', orderData); // Add this for debugging

  const response = await api.post('/orders', orderData);
      
      if (response.data.success) {
        clearCart();
        toast.success('Order placed successfully!');
        navigate('/order-confirmation', { 
          state: { 
            orderId: response.data.order._id,
            orderNumber: response.data.order.orderNumber,
            orderDetails: response.data.order
          }
        });
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Error placing order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cart || cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <GiWheat className="text-green-600" />
            Checkout
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Support local farmers while getting fresh produce delivered to your doorstep
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="order-2 lg:order-1">
            <CheckoutForm
              formData={formData}
              handleInputChange={handleInputChange}
              errors={errors}
            />
          </div>

          {/* Right Column - Cart Summary */}
          <div className="order-1 lg:order-2">
            <div className="sticky top-8">
              <CartSummary
                isSubmitting={isSubmitting}
                handleSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 