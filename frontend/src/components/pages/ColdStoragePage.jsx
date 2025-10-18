import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaThermometerHalf, FaWarehouse, FaTruck, FaCalendarAlt, FaMapMarkerAlt, FaStar, FaCheckCircle, FaFilter, FaSearch, FaListAlt, FaTimesCircle, FaArrowRight, FaMoneyBillWave, FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';
import MumbaiMap from '../components/MumbaiMap';
import { toast } from 'react-hot-toast';
import BookingManagement from '../coldStorage/BookingManagement';
import axios from 'axios';
import api from '../../utils/api';

const ColdStoragePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('search');
  const [facilities, setFacilities] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTemp, setFilterTemp] = useState('all');
  const [bookingDetails, setBookingDetails] = useState({
    quantity: '',
    duration: '',
    transportType: 'road',
    date: '',
    notes: ''
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await api.get('/cold-storage');

      setFacilities(response.data);
      
      // Simulate map loading for demo
      setTimeout(() => {
        setIsMapLoading(false);
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load cold storage facilities';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFacilitySelect = (facility) => {
    setSelectedFacility(facility);
    setBookingDetails(prev => ({
      ...prev,
      quantity: '',
      duration: '',
      date: new Date().toISOString().split('T')[0]
    }));
  };

  const validateBooking = () => {
    const errors = [];
    if (!bookingDetails.quantity || bookingDetails.quantity <= 0) {
      errors.push('Please enter a valid quantity');
    }
    if (!bookingDetails.duration || bookingDetails.duration <= 0) {
      errors.push('Please enter a valid duration');
    }
    if (!bookingDetails.date) {
      errors.push('Please select a start date');
    }
    if (new Date(bookingDetails.date) < new Date()) {
      errors.push('Start date cannot be in the past');
    }
    
    const availableQuantity = parseInt(selectedFacility.available);
    if (parseInt(bookingDetails.quantity) > availableQuantity) {
      errors.push(`Maximum available capacity is ${availableQuantity} tons`);
    }

    return errors;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFacility) return;

    const validationErrors = validateBooking();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    try {
      setShowConfirmModal(true);
    } catch (err) {
      console.error('Booking failed:', err);
      toast.error('Failed to create booking');
    }
  };

  const confirmBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const endDate = new Date(bookingDetails.date);
      endDate.setDate(endDate.getDate() + parseInt(bookingDetails.duration));

      const bookingData = {
        storageName: selectedFacility.name,
        quantity: parseInt(bookingDetails.quantity),
        startDate: bookingDetails.date,
        endDate: endDate.toISOString().split('T')[0],
        totalPrice: calculateTotalCost(),
        provider: {
          name: selectedFacility.name,
          contact: selectedFacility.contact,
          email: selectedFacility.email || 'contact@example.com'
        },
        ratePerTon: selectedFacility.pricePerTonPerDay,
        duration: parseInt(bookingDetails.duration),
        location: selectedFacility.location
      };

      await api.post('/cold-storage-bookings', bookingData);
      
      // Update available capacity locally
      const updatedFacilities = facilities.map(f => {
        if (f._id === selectedFacility._id) {
          return {
            ...f,
            available: f.available - parseInt(bookingDetails.quantity)
          };
        }
        return f;
      });
      
      setFacilities(updatedFacilities);
      setSelectedFacility(null);
      setShowConfirmModal(false);
      toast.success('Storage space booked successfully!');
      
      // Switch to bookings tab
      setActiveTab('bookings');
    } catch (err) {
      console.error('Confirmation failed:', err);
      toast.error(err.response?.data?.message || 'Failed to confirm booking');
    }
  };

  const calculateTotalCost = () => {
    if (!selectedFacility || !bookingDetails.quantity || !bookingDetails.duration) return 0;
    
    const quantity = parseFloat(bookingDetails.quantity);
    const duration = parseFloat(bookingDetails.duration);
    const pricePerTonPerDay = selectedFacility.pricePerTonPerDay;
    
    return quantity * duration * pricePerTonPerDay;
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTemp = true;
    if (filterTemp !== 'all') {
      const temp = parseFloat(facility.temperature);
      if (filterTemp === 'frozen') {
        matchesTemp = temp <= 0;
      } else if (filterTemp === 'cold') {
        matchesTemp = temp > 0 && temp <= 5;
      } else if (filterTemp === 'cool') {
        matchesTemp = temp > 5;
      }
    }
    
    return matchesSearch && matchesTemp;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-600">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white/90">Loading cold storage facilities...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-600">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-red-300 mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-white text-green-800 px-6 py-3 rounded-xl hover:bg-green-50 transition-all duration-300 shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gradient-to-br from-green-900 via-green-800 to-green-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581349485608-9469926a8e5e?q=80&w=1470')] bg-cover bg-center opacity-10"></div>
        
        {/* Floating Elements */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1 }}
          className="absolute top-20 right-10 w-64 h-64 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"
        ></motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute bottom-20 left-10 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"
        ></motion.div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="text-white max-w-2xl"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium"
            >
              <span className="flex items-center">
                <FaWarehouse className="mr-2 text-green-300" />
                Cold Storage Management
              </span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-lg"
            >
              Store Your Produce with Confidence
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-white/90 leading-relaxed drop-shadow-md mb-8"
            >
              Find, book and manage your cold storage facilities with ease
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={() => navigate('/bulk-buy')}
                className="group inline-flex items-center justify-center px-6 py-3 text-lg font-medium rounded-xl bg-white text-green-800 shadow-lg hover:shadow-xl hover:bg-green-50 transition-all duration-300"
              >
                <FaTruck className="mr-2 group-hover:translate-x-1 transition-transform" />
                Back to Bulk Buy
              </button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 -mt-12 relative z-10">
        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-2 mb-8 inline-flex"
        >
          <button
            className={`px-6 py-3 font-medium text-sm transition-all duration-300 rounded-xl ${
              activeTab === 'search'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('search')}
          >
            <span className="flex items-center gap-2">
              <FaSearch />
              Find Storage
            </span>
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm transition-all duration-300 rounded-xl ${
              activeTab === 'bookings'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            <span className="flex items-center gap-2">
              <FaListAlt />
              My Bookings
            </span>
          </button>
        </motion.div>

        {activeTab === 'search' ? (
          <>
            {/* Search and Filter Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FaFilter className="text-gray-400" />
                  <select
                    value={filterTemp}
                    onChange={(e) => setFilterTemp(e.target.value)}
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                  >
                    <option value="all">All Temperatures</option>
                    <option value="frozen">Frozen (≤ 0°C)</option>
                    <option value="cold">Cold (0-5°C)</option>
                    <option value="cool">Cool (&gt; 5°C)</option>
                  </select>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Map Section */}
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="lg:col-span-2"
              >
                <motion.div 
                  variants={fadeInUp}
                  className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
                >
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-green-600" />
                    Location Map
                  </h2>
                  <div className="h-[500px] bg-gray-100 rounded-xl overflow-hidden">
                    {isMapLoading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-gray-600">Loading map...</div>
                      </div>
                    ) : (
                      <MumbaiMap />
                    )}
                  </div>
                </motion.div>
              </motion.div>

              {/* Facilities List */}
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="lg:col-span-1"
              >
                <motion.div 
                  variants={fadeInUp}
                  className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
                >
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <FaWarehouse className="text-green-600" />
                    Available Facilities
                  </h2>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredFacilities.map(facility => (
                      <motion.div
                        key={facility.id}
                        variants={fadeInUp}
                        whileHover={{ y: -5 }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          selectedFacility?.id === facility.id
                            ? 'border-green-600 bg-green-50 shadow-md'
                            : 'border-gray-200 hover:border-green-400 hover:shadow-md'
                        }`}
                        onClick={() => handleFacilitySelect(facility)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg text-gray-800">{facility.name}</h3>
                          <div className="flex items-center text-yellow-500">
                            <FaStar />
                            <span className="ml-1 text-gray-700">{facility.rating}</span>
                            <span className="ml-2 text-sm text-gray-500">({facility.reviews})</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="flex items-center gap-2 text-gray-600">
                            <FaMapMarkerAlt className="text-green-600" />
                            {facility.location}
                          </p>
                          <p className="flex items-center gap-2 text-gray-600">
                            <FaThermometerHalf className="text-green-600" />
                            Temperature: {facility.temperature} degrees Celsius
                          </p>
                          <p className="flex items-center gap-2 text-gray-600">
                            <FaWarehouse className="text-green-600" />
                            Available: {facility.available} tons
                          </p>
                          <p className="font-medium text-green-700 mt-2">
                            ₹{facility.price}/ton/day
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Booking Form */}
            {selectedFacility && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
              >
                <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                  <FaCalendarAlt className="text-green-600" />
                  Book Storage Space
                </h2>
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (tons)</label>
                      <input
                        type="number"
                        value={bookingDetails.quantity}
                        onChange={(e) => setBookingDetails(prev => ({ ...prev, quantity: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                      <input
                        type="number"
                        value={bookingDetails.duration}
                        onChange={(e) => setBookingDetails(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={bookingDetails.date}
                        onChange={(e) => setBookingDetails(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transport Type</label>
                      <select
                        value={bookingDetails.transportType}
                        onChange={(e) => setBookingDetails(prev => ({ ...prev, transportType: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                      >
                        <option value="road">Road Transport</option>
                        <option value="rail">Rail Transport</option>
                        <option value="self">Self Transport</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                    <textarea
                      value={bookingDetails.notes}
                      onChange={(e) => setBookingDetails(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedFacility(null)}
                      className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && selectedFacility && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
                >
                  <h3 className="text-xl font-semibold mb-4">Confirm Booking</h3>
                  <div className="space-y-2 mb-6">
                    <p><span className="font-medium">Facility:</span> {selectedFacility.name}</p>
                    <p><span className="font-medium">Quantity:</span> {bookingDetails.quantity} tons</p>
                    <p><span className="font-medium">Duration:</span> {bookingDetails.duration} days</p>
                    <p><span className="font-medium">Start Date:</span> {bookingDetails.date}</p>
                    <p><span className="font-medium">Total Cost:</span> ₹{calculateTotalCost().toLocaleString()}</p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmBooking}
                      className="flex-1 px-4 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all duration-300 shadow-md"
                    >
                      Confirm
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </>
        ) : (
          <BookingManagement />
        )}
      </div>
    </div>
  );
};

export default ColdStoragePage; 