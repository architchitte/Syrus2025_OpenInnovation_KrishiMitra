require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const app = require('./app');

// Validate required environment variables
const requiredEnvs = ['MONGO_URI', 'JWT_SECRET'];
const missing = requiredEnvs.filter((k) => !process.env[k]);
if (missing.length) {
  logger.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).catch(err => {
  logger.error('MongoDB connection error:', err);
  process.exit(1);
});

mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
mongoose.connection.on('error', (err) => logger.error('MongoDB connection error:', err));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

const server = app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
  // Force exit after 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcing shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Optionally seed data when explicitly requested
if (process.env.SEED_ON_START === 'true') {
  const seedData = require('./utils/seedData');
  seedData(true).catch(err => logger.error('Seeding failed', err));
}
