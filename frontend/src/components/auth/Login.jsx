import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaLeaf, FaSpinner } from 'react-icons/fa';
import { loginUser, setToken } from '../../utils/authApi';
import { useAuth } from '../../context/AuthContext';
import Input from '../Input';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const { setUser } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
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
    
    if (loginMethod === 'password') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
    } else {
      // OTP validation
      if (!formData.email.trim()) {
        newErrors.email = 'Email or Mobile Number is required';
      }
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
      // Call API to login user
      const response = await loginUser({
        email: formData.email,
        password: formData.password
      });
      
      // Save token to localStorage
      setToken(response.token);
      // Update AuthContext so UI updates immediately
      if (setUser) {
        setUser({ id: response.id, name: response.name, email: response.email, role: response.role });
        localStorage.setItem('user', JSON.stringify({ id: response.id, name: response.name, email: response.email, role: response.role }));
      }

      // Show success toast
      toast.success('Login successful! Welcome to KrishiMitra');

      // Redirect based on role: farmers -> dashboard; consumers -> products page
      const role = response.role || (JSON.parse(localStorage.getItem('user') || '{}').role);
      if (role === 'farmer') {
        navigate('/dashboard');
      } else {
        navigate('/products');
      }
    } catch (error) {
      setApiError(error.message || 'Login failed. Please check your credentials.');
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
    setErrors({});
    setApiError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-earth-green-50 to-earth-brown-50 px-4 py-12">
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
              <FaLeaf className="text-earth-green-600 text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-poppins">Welcome to KrishiMitra</h1>
            <p className="text-gray-600 font-poppins">Connect with farmers and consumers</p>
          </div>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Mobile Input */}
            <div className="mb-6">
              <Input
                label="Email or Mobile Number"
                type={loginMethod === 'password' ? 'email' : 'text'} 
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder={loginMethod === 'password' ? "Enter your email" : "Enter email or mobile number"}
                required
                className="w-full"
              />
            </div>

            {/* Password Input */}
            {loginMethod === 'password' && (
              <div className="mb-6">
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Enter your password"
                  required
                  className="w-full"
                />
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-earth-green-600 focus:ring-earth-green-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 font-poppins cursor-pointer">
                  Remember me
                </label>
              </div>
              
              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-earth-green-600 hover:text-earth-green-500 font-poppins transition-colors duration-200"
              >
                Forgot Password?
              </Link>
            </div>
            
            {/* Error Message */}
            {apiError && (
              <div className="p-4 mb-6 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-poppins">
                {apiError}
              </div>
            )}
            
            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-poppins disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-3 h-5 w-5" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
            
            {/* Toggle Login Method */}
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={toggleLoginMethod}
                className="text-sm text-earth-green-600 hover:text-earth-green-500 focus:outline-none font-poppins transition-colors duration-200 underline"
              >
                {loginMethod === 'password' ? 'Login with OTP instead' : 'Login with password instead'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 font-poppins">
              New to KrishiMitra?{' '}
              <Link to="/register" className="font-medium text-earth-green-600 hover:text-earth-green-500">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 