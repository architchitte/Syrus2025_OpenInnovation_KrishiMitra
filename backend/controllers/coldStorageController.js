const ColdStorage = require('../models/ColdStorage');
const ColdStorageBooking = require('../models/ColdStorageBooking');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const coldStorageAPI = require('../utils/coldStorageAPI');

// @desc    Get all cold storage facilities
// @route   GET /api/cold-storage
// @access  Public
exports.getAllColdStorage = asyncHandler(async (req, res) => {
  const { location, minCapacity, maxPrice, features } = req.query;
  
  // Build filter object
  const filter = { active: true };
  
  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }
  
  if (minCapacity) {
    filter.capacity = { $gte: parseInt(minCapacity) };
  }
  
  if (maxPrice) {
    filter.pricePerTonPerDay = { $lte: parseInt(maxPrice) };
  }
  
  if (features) {
    const featureArray = features.split(',');
    filter.features = { $all: featureArray };
  }
  
  const coldStorages = await ColdStorage.find(filter);
  res.status(200).json(coldStorages);
});

// @desc    Get cold storage by ID
// @route   GET /api/cold-storage/:id
// @access  Public
exports.getColdStorageById = asyncHandler(async (req, res) => {
  const coldStorage = await ColdStorage.findById(req.params.id);
  
  if (coldStorage) {
    res.status(200).json(coldStorage);
  } else {
    res.status(404);
    throw new Error('Cold storage facility not found');
  }
});

// @desc    Create cold storage
// @route   POST /api/cold-storage
// @access  Private/Facility Owner
exports.createColdStorage = asyncHandler(async (req, res) => {
  const {
    name,
    location,
    coordinates,
    capacity,
    available,
    temperature,
    price,
    pricePerTonPerDay,
    features,
    contact
  } = req.body;

  const coldStorage = await ColdStorage.create({
    name,
    location,
    coordinates,
    capacity,
    available,
    temperature,
    price,
    pricePerTonPerDay,
    features,
    contact,
    ownerId: req.user._id
  });

  res.status(201).json(coldStorage);
});

// @desc    Update cold storage
// @route   PUT /api/cold-storage/:id
// @access  Private/Facility Owner
exports.updateColdStorage = asyncHandler(async (req, res) => {
  const coldStorage = await ColdStorage.findById(req.params.id);
  
  if (!coldStorage) {
    res.status(404);
    throw new Error('Cold storage facility not found');
  }
  
  // Check if user is owner
  if (coldStorage.ownerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this facility');
  }
  
  const updatedColdStorage = await ColdStorage.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json(updatedColdStorage);
});

// @desc    Delete cold storage
// @route   DELETE /api/cold-storage/:id
// @access  Private/Facility Owner
exports.deleteColdStorage = asyncHandler(async (req, res) => {
  const coldStorage = await ColdStorage.findById(req.params.id);
  
  if (!coldStorage) {
    res.status(404);
    throw new Error('Cold storage facility not found');
  }
  
  // Check if user is owner
  if (coldStorage.ownerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this facility');
  }
  
  // Instead of deleting, set active to false
  coldStorage.active = false;
  await coldStorage.save();
  
  res.status(200).json({ message: 'Cold storage facility deactivated' });
});

// @desc    Create cold storage booking
// @route   POST /api/cold-storage/:id/book
// @access  Private
exports.createBooking = asyncHandler(async (req, res) => {
  const coldStorage = await ColdStorage.findById(req.params.id);
  
  if (!coldStorage) {
    res.status(404);
    throw new Error('Cold storage facility not found');
  }
  
  const {
    quantity,
    duration,
    transportType,
    deliveryDate,
    notes
  } = req.body;
  
  // Check if requested quantity is available
  if (quantity > coldStorage.available) {
    res.status(400);
    throw new Error('Requested quantity exceeds available capacity');
  }
  
  // Calculate total price
  const totalPrice = coldStorage.pricePerTonPerDay * quantity * duration;
  // Build full booking payload matching ColdStorageBooking schema
  // Determine start/end dates
  const startDate = deliveryDate ? new Date(deliveryDate) : new Date();
  const endDate = new Date(startDate.getTime());
  endDate.setDate(endDate.getDate() + parseInt(duration || 1));

  // Get provider info from owner user if available
  let provider = { name: '', contact: '', email: '' };
  try {
    const owner = await User.findById(coldStorage.ownerId);
    if (owner) {
      provider = { name: owner.name || coldStorage.name, contact: owner.phoneNumber || owner.phone || coldStorage.contact || '', email: owner.email || '' };
    } else {
      provider = { name: coldStorage.name, contact: coldStorage.contact || '', email: '' };
    }
  } catch (e) {
    provider = { name: coldStorage.name, contact: coldStorage.contact || '', email: '' };
  }

  const bookingPayload = {
    userId: req.user._id,
    storageId: coldStorage._id,
    storageName: coldStorage.name,
    quantity,
    duration: parseInt(duration || 1),
    startDate,
    endDate,
    totalPrice,
    paymentStatus: 'awaiting',
    status: 'pending',
    provider,
    ratePerTon: coldStorage.pricePerTonPerDay || 0,
    location: coldStorage.location
  };

  const booking = await ColdStorageBooking.create(bookingPayload);
  
  // Update available capacity
  coldStorage.available -= quantity;
  await coldStorage.save();
  
  res.status(201).json(booking);
});

// @desc    Get all bookings for a user
// @route   GET /api/cold-storage/bookings
// @access  Private
exports.getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await ColdStorageBooking.find({ userId: req.user._id })
    .populate('storageId', 'name location temperature');
  
  res.status(200).json(bookings);
});

// @desc    Get bookings for a facility owner
// @route   GET /api/cold-storage/facility-bookings
// @access  Private/Facility Owner
exports.getFacilityBookings = asyncHandler(async (req, res) => {
  // Get all cold storages owned by user
  const userStorages = await ColdStorage.find({ ownerId: req.user._id }).select('_id');
  const storageIds = userStorages.map(storage => storage._id);
  
  // Get all bookings for those storages
  const bookings = await ColdStorageBooking.find({ 
    storageId: { $in: storageIds } 
  }).populate('userId', 'name email');
  
  res.status(200).json(bookings);
});

// @desc    Update booking status
// @route   PUT /api/cold-storage/bookings/:id
// @access  Private/Facility Owner
exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await ColdStorageBooking.findById(req.params.id);
  
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  
  // Get the cold storage to check ownership
  const coldStorage = await ColdStorage.findById(booking.storageId);
  
  if (!coldStorage) {
    res.status(404);
    throw new Error('Cold storage facility not found');
  }
  
  // Check if user is owner of the cold storage
  if (coldStorage.ownerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this booking');
  }
  
  const { status } = req.body;
  
  booking.status = status;
  
  // If cancelled, restore available capacity
  if (status === 'canceled') {
    coldStorage.available += booking.quantity;
    await coldStorage.save();
  }
  
  await booking.save();
  
  res.status(200).json(booking);
});

// @desc    Check facility availability
// @route   GET /api/cold-storage/:id/availability
// @access  Public
exports.checkAvailability = asyncHandler(async (req, res) => {
  const { quantity, duration } = req.query;
  
  if (!quantity || !duration) {
    res.status(400);
    throw new Error('Quantity and duration are required');
  }
  
  const storageId = req.params.id;
  const coldStorage = await ColdStorage.findById(storageId);
  
  if (!coldStorage) {
    res.status(404);
    throw new Error('Cold storage facility not found');
  }
  
  // Check if we have enough capacity
  const available = coldStorage.available >= parseInt(quantity);
  
  // Get additional availability info from utility function
  const availabilityInfo = await coldStorageAPI.checkAvailability(
    storageId,
    parseInt(quantity),
    parseInt(duration)
  );
  
  // Combine real DB data with utility function data
  const result = {
    ...availabilityInfo,
    available: available && availabilityInfo.available,
    facilityName: coldStorage.name,
    location: coldStorage.location,
    temperature: coldStorage.temperature,
    pricePerTonPerDay: coldStorage.pricePerTonPerDay,
    totalPrice: coldStorage.pricePerTonPerDay * parseInt(quantity) * parseInt(duration)
  };
  
  res.status(200).json(result);
});

// @desc    Find nearby storage facilities
// @route   GET /api/cold-storage/nearby
// @access  Public
exports.findNearbyColdStorage = asyncHandler(async (req, res) => {
  const { lat, lng, radius } = req.query;
  
  if (!lat || !lng) {
    res.status(400);
    throw new Error('Latitude and longitude are required');
  }
  
  const coordinates = {
    lat: parseFloat(lat),
    lng: parseFloat(lng)
  };
  
  // Get nearby facilities from utility function
  const nearbyFacilities = await coldStorageAPI.findNearbyColdStorage(
    coordinates,
    radius ? parseInt(radius) : 50
  );
  
  res.status(200).json(nearbyFacilities);
});

// @desc    Calculate delivery estimates
// @route   GET /api/cold-storage/delivery-estimate
// @access  Public
exports.calculateDeliveryEstimate = asyncHandler(async (req, res) => {
  const { lat, lng, quantity, transportType } = req.query;
  
  if (!lat || !lng || !quantity || !transportType) {
    res.status(400);
    throw new Error('Location coordinates, quantity, and transport type are required');
  }
  
  const location = {
    lat: parseFloat(lat),
    lng: parseFloat(lng)
  };
  
  // Calculate delivery estimate from utility function
  const deliveryEstimate = coldStorageAPI.calculateDeliveryEstimate(
    location,
    parseInt(quantity),
    transportType
  );
  
  res.status(200).json(deliveryEstimate);
});