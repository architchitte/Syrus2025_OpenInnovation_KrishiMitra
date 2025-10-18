import { useState, useEffect } from 'react';
import { FaCheckCircle, FaClock, FaTimesCircle, FaMoneyBillWave, FaEye, FaTimes, FaWarehouse, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import api from '../../utils/api';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingCancel, setProcessingCancel] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await api.get('/cold-storage-bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.response?.data?.message || 'Failed to fetch bookings');
      toast.error(error.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (booking) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    try {
      setProcessingPayment(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      await api.patch(`/cold-storage-bookings/${selectedBooking._id}/payment`, {});

      // Update local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking._id === selectedBooking._id
            ? { ...booking, paymentStatus: 'paid', status: 'confirmed' }
            : booking
        )
      );

      setShowPaymentModal(false);
      setSelectedBooking(null);
      toast.success('Payment processed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.message || 'Payment processing failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancel = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      setProcessingCancel(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      await api.delete(`/cold-storage-bookings/${selectedBooking._id}`);

      // Update local state
      setBookings(prevBookings =>
        prevBookings.filter(booking => booking._id !== selectedBooking._id)
      );

      setShowCancelModal(false);
      setSelectedBooking(null);
      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setProcessingCancel(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || booking.paymentStatus === paymentFilter;
    return matchesStatus && matchesPayment;
  });

  const calculateSummary = () => {
    return filteredBookings.reduce((acc, booking) => ({
      totalBookings: acc.totalBookings + 1,
      totalTons: acc.totalTons + booking.quantity,
      totalAmount: acc.totalAmount + booking.totalPrice,
      pendingAmount: acc.pendingAmount + (booking.paymentStatus === 'awaiting' ? booking.totalPrice : 0)
    }), { totalBookings: 0, totalTons: 0, totalAmount: 0, pendingAmount: 0 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <FaTimesCircle className="text-red-500 text-4xl mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Bookings</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchBookings}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="flex flex-wrap gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            >
              <option value="all">All Payments</option>
              <option value="awaiting">Awaiting</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-800">{calculateSummary().totalBookings}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Tons</p>
              <p className="text-2xl font-bold text-gray-800">{calculateSummary().totalTons}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">₹{calculateSummary().totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-600">₹{calculateSummary().pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredBookings.map(booking => (
          <div
            key={booking._id}
            className="bg-white rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{booking.storageName}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {booking.status === 'confirmed' ? (
                      <span className="flex items-center gap-1">
                        <FaCheckCircle /> Confirmed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <FaClock /> Pending
                      </span>
                    )}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {booking.paymentStatus === 'paid' ? (
                      <span className="flex items-center gap-1">
                        <FaCheckCircle /> Paid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <FaMoneyBillWave /> Awaiting
                      </span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
                  <div>
                    <p className="font-medium">Quantity</p>
                    <p>{booking.quantity} tons</p>
                  </div>
                  <div>
                    <p className="font-medium">Duration</p>
                    <p>{new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-medium">Total Price</p>
                    <p className="text-green-600 font-semibold">₹{booking.totalPrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleViewDetails(booking)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
                >
                  <FaEye /> View Details
                </button>
                {booking.status === 'pending' && (
                  <>
                    {booking.paymentStatus === 'awaiting' && (
                      <button
                        onClick={() => handlePayNow(booking)}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                      >
                        <FaMoneyBillWave /> Pay Now
                      </button>
                    )}
                    <button
                      onClick={() => handleCancel(booking)}
                      className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200 flex items-center gap-2"
                    >
                      <FaTimesCircle /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <FaWarehouse className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h3>
            <p className="text-gray-500">You haven't made any cold storage bookings yet.</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Booking Details</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedBooking(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-600">Storage Provider</p>
                  <p>{selectedBooking.provider.name}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Location</p>
                  <p>{selectedBooking.location}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Contact</p>
                  <p>{selectedBooking.provider.contact}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Email</p>
                  <p>{selectedBooking.provider.email}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold mb-2">Booking Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-600">Quantity</p>
                    <p>{selectedBooking.quantity} tons</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Rate per Ton</p>
                    <p>₹{selectedBooking.ratePerTon}/ton/day</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Duration</p>
                    <p>{selectedBooking.duration} days</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Total Amount</p>
                    <p className="text-green-600 font-semibold">
                      ₹{selectedBooking.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold mb-2">Status Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-600">Booking Status</p>
                    <p className={selectedBooking.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}>
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Payment Status</p>
                    <p className={selectedBooking.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                      {selectedBooking.paymentStatus.charAt(0).toUpperCase() + selectedBooking.paymentStatus.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Confirm Cancellation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your booking at {selectedBooking.storageName}?
              This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={processingCancel}
              >
                No, Keep It
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2"
                disabled={processingCancel}
              >
                {processingCancel ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Complete Payment</h3>
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Booking Summary</p>
                <p className="font-medium">Storage: {selectedBooking.storageName}</p>
                <p className="font-medium">Duration: {selectedBooking.duration} days</p>
                <p className="font-medium">Quantity: {selectedBooking.quantity} tons</p>
                <p className="text-lg font-semibold text-green-600 mt-2">
                  Total Amount: ₹{selectedBooking.totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={processingPayment}
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaMoneyBillWave />
                    Pay Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement; 