import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaShoppingBag, FaCog, FaHistory } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const [userData, setUserData] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    address: user?.address || '',
    role: user?.role || 'consumer',
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''
  }));

  const [orderHistory] = useState([
    {
      id: 1,
      date: '2024-03-15',
      total: 1500,
      status: 'Delivered',
      items: ['Fresh Tomatoes', 'Organic Rice']
    },
    {
      id: 2,
      date: '2024-03-10',
      total: 800,
      status: 'Processing',
      items: ['Organic Wheat', 'Fresh Vegetables']
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the user profile
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-sidebar">
            <div className="profile-header">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <h2>{userData.name || user?.name || 'Your Name'}</h2>
            <p>{(userData.role === 'consumer' || user?.role === 'consumer') ? 'Consumer' : 'Farmer'}</p>
          </div>
          
          <nav className="profile-nav">
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUser /> Profile
            </button>
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <FaShoppingBag /> Orders
            </button>
            <button 
              className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <FaHistory /> History
            </button>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FaCog /> Settings
            </button>
          </nav>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Personal Information</h2>
                {!isEditing ? (
                  <button 
                    className="edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button 
                    className="save-btn"
                    onClick={handleSave}
                  >
                    Save Changes
                  </button>
                )}
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label>
                    <FaUser /> Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={userData.name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.name || user?.name}</p>
                  )}
                </div>

                <div className="info-item">
                  <label>
                    <FaEnvelope /> Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.email || user?.email}</p>
                  )}
                </div>

                <div className="info-item">
                  <label>
                    <FaPhone /> Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.phone || user?.phoneNumber}</p>
                  )}
                </div>

                <div className="info-item">
                  <label>
                    <FaMapMarkerAlt /> Address
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={userData.address}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.address || user?.address}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Farmer-specific details */}
          {(userData.role === 'farmer' || user?.role === 'farmer') && (
            <div className="profile-section">
              <h2>Farmer Details</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Farm Name</label>
                  <p>{user?.farmName || 'Not provided'}</p>
                </div>
                <div className="info-item">
                  <label>Farm Location</label>
                  <p>{user?.farmLocation || 'Not provided'}</p>
                </div>
                <div className="info-item">
                  <label>Products Grown</label>
                  <p>{(user?.productsGrown || []).join(', ') || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="profile-section">
              <h2>Recent Orders</h2>
              <div className="orders-list">
                {orderHistory.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <span>Order #{order.id}</span>
                      <span className={`order-status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-details">
                      <p>Date: {order.date}</p>
                      <p>Items: {order.items.join(', ')}</p>
                      <p>Total: ₹{order.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="profile-section">
              <h2>Activity History</h2>
              <div className="history-timeline">
                <div className="timeline-item">
                  <div className="timeline-date">March 15, 2024</div>
                  <div className="timeline-content">
                    <h3>Order Delivered</h3>
                    <p>Your order #1 has been successfully delivered</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-date">March 10, 2024</div>
                  <div className="timeline-content">
                    <h3>Order Placed</h3>
                    <p>You placed a new order for organic products</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-date">March 1, 2024</div>
                  <div className="timeline-content">
                    <h3>Profile Updated</h3>
                    <p>You updated your contact information</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="profile-section">
              <h2>Account Settings</h2>
              <div className="settings-grid">
                <div className="settings-item">
                  <h3>Notifications</h3>
                  <div className="setting-option">
                    <label>
                      <input type="checkbox" defaultChecked />
                      Email Notifications
                    </label>
                  </div>
                  <div className="setting-option">
                    <label>
                      <input type="checkbox" defaultChecked />
                      SMS Notifications
                    </label>
                  </div>
                </div>
                <div className="settings-item">
                  <h3>Privacy</h3>
                  <div className="setting-option">
                    <label>
                      <input type="checkbox" defaultChecked />
                      Show Profile to Others
                    </label>
                  </div>
                </div>
                <div className="settings-item">
                  <h3>Security</h3>
                  <button className="change-password-btn">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 