import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaLeaf, FaSpinner, FaSeedling } from 'react-icons/fa';
import { registerUser } from '../../utils/authApi';
import Input from '../Input';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
    role: 'consumer' // Default to consumer
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
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
    // Clear API error when user starts typing
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setApiError('');
    
    try {
      // Prepare data for API
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        role: formData.role
      };
      
      // Call API to register user
      await registerUser(userData);
      
      // Show success toast
      toast.success('Registration successful! Redirecting to login...');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      // Prefer backend provided message structure if available
      const backend = error?.response?.data || error;
      const message = backend?.error?.message || backend?.message || error.message || 'Registration failed. Please try again.';
      setApiError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-earth-green-50 opacity-20">
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '30px 30px'
            }}></div>
          </div>
          
          {/* Header with logo and welcome text */}
          <div className="relative p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-earth-green-100 mb-4">
              <FaSeedling className="text-earth-green-600 text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-poppins">Create Your KrishiMitra Account</h1>
            <p className="text-gray-600 font-poppins">Join our community of farmers and consumers</p>
          </div>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Enter your full name"
              required
            />
            
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
              required
            />
            
            <Input
              label="Phone Number"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber}
              placeholder="Enter your phone number"
              required
            />
            
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Create a password"
              required
            />
            
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              required
            />
            
            <div className="form-group">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                <FaMapMarkerAlt className="inline mr-2 text-earth-green-600" />
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-earth-green-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                } bg-white text-gray-700 placeholder-gray-400 font-poppins`}
                placeholder="Enter your address"
                rows="3"
                required
              />
              {errors.address && <p className="mt-1 text-sm text-red-600 font-poppins">{errors.address}</p>}
            </div>
            
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                <FaUser className="inline mr-2 text-earth-green-600" />
                Role
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="consumer"
                    checked={formData.role === 'consumer'}
                    onChange={handleChange}
                    className="h-4 w-4 text-earth-green-600 focus:ring-earth-green-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700 font-poppins">Consumer</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="farmer"
                    checked={formData.role === 'farmer'}
                    onChange={handleChange}
                    className="h-4 w-4 text-earth-green-600 focus:ring-earth-green-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700 font-poppins">Farmer</span>
                </label>
              </div>
            </div>
            
            {apiError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm font-poppins">
                {apiError}
              </div>
            )}
            
            <button 
              type="submit" 
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 font-poppins"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 font-poppins">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-earth-green-600 hover:text-earth-green-500">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 