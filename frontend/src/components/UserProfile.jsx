import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from './layout/Navbar';
import { useAuth } from '../context/AuthContext';

// Fallback user data
const fallbackUser = {
  _id: '123',
  name: 'Rahul Kumar',
  email: 'rahul@example.com',
  phone: '9876543210',
  address: {
    street: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  },
  role: 'consumer'
};

// Fallback order data
const fallbackOrders = [
  {
    _id: 'ORD12345',
    date: '2023-03-15T10:30:00',
    status: 'Delivered',
    total: 450,
    items: [
      {
        productId: {
          _id: '1',
          name: 'Organic Tomatoes',
          image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfad?q=80&w=2070',
          price: 40,
          discountPrice: 35
        },
        quantity: 2
      },
      {
        productId: {
          _id: '5',
          name: 'Turmeric Powder',
          image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f1?q=80&w=2070',
          price: 80
        },
        quantity: 1
      }
    ]
  },
  {
    _id: 'ORD12346',
    date: '2023-03-10T14:15:00',
    status: 'Delivered',
    total: 320,
    items: [
      {
        productId: {
          _id: '2',
          name: 'Fresh Spinach',
          image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=2432',
          price: 30
        },
        quantity: 2
      },
      {
        productId: {
          _id: '6',
          name: 'Organic Apples',
          image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=2070',
          price: 70,
          discountPrice: 65
        },
        quantity: 4
      }
    ]
  }
];

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  const navigate = useNavigate();
  const { user: ctxUser, logout, setUser: setAuthUser } = useAuth();

  useEffect(() => {
    // If no auth user in context, redirect to login
    if (!ctxUser && !localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users/profile');
        // Normalize response: { success, data }
        const normalized = response?.data?.data || response?.data || null;
        // Keep local state and AuthContext in sync
        setUser(normalized);
        try { setAuthUser && setAuthUser(normalized); localStorage.setItem('user', JSON.stringify(normalized)); } catch (e) { /* ignore */ }
        setFormData({
          name: normalized?.name || '',
          email: normalized?.email || '',
          phone: normalized?.phone || '',
          street: normalized?.address?.street || '',
          city: normalized?.address?.city || '',
          state: normalized?.address?.state || '',
          pincode: normalized?.address?.pincode || ''
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Use fallback data for demo
        setUser(fallbackUser);
        setFormData({
          name: fallbackUser.name || '',
          email: fallbackUser.email || '',
          phone: fallbackUser.phone || '',
          street: fallbackUser.address?.street || '',
          city: fallbackUser.address?.city || '',
          state: fallbackUser.address?.state || '',
          pincode: fallbackUser.address?.pincode || ''
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        const normalized = response?.data?.data || response?.data || [];
        setOrders(normalized);
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Use fallback data for demo
        setOrders(fallbackOrders);
      }
    };

    fetchUserProfile();
    fetchOrders();
  }, [token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUserData = {
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }
      };

      await axios.put(`${API_URL}/users/profile`, updatedUserData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setUser(prev => ({
        ...prev,
        ...updatedUserData
      }));

      // Update user data in localStorage if needed
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...userData,
        name: formData.name
      }));

      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      logout();
    } catch (e) {
      try { localStorage.removeItem('token'); localStorage.removeItem('user'); } catch (_) {}
    }
    navigate('/login');
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {user?.name?.charAt(0)}
                </div>
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
              
              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'profile' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Profile Information
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'orders' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Order History
                </button>
                <button 
                  onClick={() => setActiveTab('address')}
                  className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'address' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Saved Addresses
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'settings' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Account Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Logout
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:w-3/4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === 'profile' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Profile Information</h2>
                    <button 
                      onClick={() => setEditing(!editing)}
                      className="text-green-600 hover:text-green-700"
                    >
                      {editing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>
                  
                  {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
                      {error}
                    </div>
                  )}
                  
                  {editing ? (
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input 
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input 
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                            disabled
                          />
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input 
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-lg mb-3 mt-6">Address Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address
                          </label>
                          <input 
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input 
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input 
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            PIN Code
                          </label>
                          <input 
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button 
                          type="button"
                          onClick={() => setEditing(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-4 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                          <p className="mt-1">{user?.name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Email</h3>
                          <p className="mt-1">{user?.email}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                          <p className="mt-1">{user?.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
                          <p className="mt-1 capitalize">{user?.role || 'Consumer'}</p>
                        </div>
                      </div>
                      
                      <div className="border-t pt-6">
                        <h3 className="font-medium text-lg mb-3">Address Information</h3>
                        {user?.address ? (
                          <div>
                            <p>{user.address.street}</p>
                            <p>{user.address.city}, {user.address.state} {user.address.pincode}</p>
                          </div>
                        ) : (
                          <p className="text-gray-500">No address information provided.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Order History</h2>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <h3 className="text-lg font-medium">No orders yet</h3>
                      <p className="text-gray-500 mt-2">When you place orders, they will appear here.</p>
                      <Link to="/" className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order._id} className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">Order #{order._id}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(order.date).toLocaleDateString('en-US', {
                                  year: 'numeric', month: 'long', day: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                                order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status}
                              </span>
                              <p className="font-bold mt-1">₹{order.total.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-medium mb-3">Items</h3>
                            <div className="space-y-4">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-center">
                                  <img 
                                    src={item.productId.image}
                                    alt={item.productId.name}
                                    className="w-16 h-16 object-cover rounded mr-4"
                                  />
                                  <div className="flex-grow">
                                    <Link to={`/product/${item.productId._id}`} className="font-medium hover:text-green-600">
                                      {item.productId.name}
                                    </Link>
                                    <p className="text-gray-500">Qty: {item.quantity}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">
                                      ₹{(item.productId.discountPrice || item.productId.price).toFixed(2)}
                                    </p>
                                    <p className="text-gray-500">
                                      ₹{((item.productId.discountPrice || item.productId.price) * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 px-4 py-3 flex justify-between">
                            <button className="text-green-600 hover:text-green-700 font-medium">
                              Reorder
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'address' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Saved Addresses</h2>
                  
                  {user?.address ? (
                    <div className="border rounded-lg p-4 mb-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">Default Address</h3>
                        <button className="text-green-600 hover:text-green-700 text-sm">
                          Edit
                        </button>
                      </div>
                      <p>{user.name}</p>
                      <p>{user.address.street}</p>
                      <p>{user.address.city}, {user.address.state} {user.address.pincode}</p>
                      <p>{user.phone}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No addresses saved yet.</p>
                  )}
                  
                  <button className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    + Add New Address
                  </button>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                  
                  <div className="border-b pb-6 mb-6">
                    <h3 className="font-medium mb-4">Change Password</h3>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input 
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input 
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input 
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Update Password
                      </button>
                    </form>
                  </div>
                  
                  <div className="border-b pb-6 mb-6">
                    <h3 className="font-medium mb-2">Notification Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input type="checkbox" id="email-notifications" className="h-4 w-4 text-green-600 rounded" />
                        <label htmlFor="email-notifications" className="ml-2 text-gray-700">
                          Email Notifications
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="sms-notifications" className="h-4 w-4 text-green-600 rounded" />
                        <label htmlFor="sms-notifications" className="ml-2 text-gray-700">
                          SMS Notifications
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="marketing-emails" className="h-4 w-4 text-green-600 rounded" />
                        <label htmlFor="marketing-emails" className="ml-2 text-gray-700">
                          Marketing Emails
                        </label>
                      </div>
                    </div>
                    <button className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                      Save Preferences
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
                    <p className="text-gray-600 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 