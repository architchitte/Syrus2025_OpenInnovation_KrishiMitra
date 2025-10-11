const express = require('express');
const router = express.Router();
const { protect, admin, farmer } = require('../middleware/authMiddleware');
const {
  getAllColdStorage,
  getColdStorageById,
  createColdStorage,
  updateColdStorage,
  deleteColdStorage,
  createBooking,
  getUserBookings,
  getFacilityBookings,
  updateBookingStatus,
  checkAvailability,
  findNearbyColdStorage,
  calculateDeliveryEstimate
} = require('../controllers/coldStorageController');

// Public routes
router.get('/', getAllColdStorage);
// Specific utility routes must come before parameterized routes to avoid route conflicts
router.get('/nearby', findNearbyColdStorage);
router.get('/delivery-estimate', calculateDeliveryEstimate);
router.get('/:id/availability', checkAvailability);
router.get('/:id', getColdStorageById);

// Protected routes for all authenticated users
router.post('/:id/book', protect, createBooking);
router.get('/bookings', protect, getUserBookings);

// Protected routes for facility owners
router.post('/', protect, createColdStorage);
router.put('/:id', protect, updateColdStorage);
router.delete('/:id', protect, deleteColdStorage);
router.get('/facility-bookings', protect, getFacilityBookings);
router.put('/bookings/:id', protect, updateBookingStatus);

module.exports = router;