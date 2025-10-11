require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const responseHandler = require('./middleware/responseHandler');

const app = express();

// Basic security middleware
app.use(helmet());
app.use(hpp());
app.use(mongoSanitize());
app.use(xss());

// Body parser with size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS - limit origins via env variable (comma separated)
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed from this origin'));
  }
}));

// Rate limiter (basic) - tune in production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // in production, use the logger stream
  app.use(morgan('combined', { stream: logger.stream }));
}

// Routes
// Response helpers
app.use(responseHandler);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/pricing', require('./routes/pricingRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/protected', require('./routes/protectedRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/cold-storage', require('./routes/coldStorageRoutes'));
app.use('/api/bulk-buy', require('./routes/bulkBuyRoutes'));
app.use('/api/cold-storage-bookings', require('./routes/coldStorageBookings'));

// Centralized error handler (should be last)
app.use(errorHandler);

module.exports = app;
