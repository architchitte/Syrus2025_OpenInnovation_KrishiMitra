const axios = require('axios');
const axiosRetry = require('axios-retry');

const client = axios.create({
  timeout: 10000, // 10 seconds
  headers: { 'Content-Type': 'application/json' }
});

// Retry on network errors and 5xx responses
axiosRetry(client, { retries: 3, retryDelay: axiosRetry.exponentialDelay, retryCondition: axiosRetry.isRetryableError });

module.exports = client;
