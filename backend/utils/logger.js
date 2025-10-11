// Minimal logger wrapper. Replace with winston or pino in production.
const util = require('util');

const logger = {
  info: (...args) => console.log('[info]', ...args.map(a => (typeof a === 'object' ? util.inspect(a, { depth: 5 }) : a))),
  warn: (...args) => console.warn('[warn]', ...args.map(a => (typeof a === 'object' ? util.inspect(a, { depth: 5 }) : a))),
  error: (...args) => console.error('[error]', ...args.map(a => (typeof a === 'object' ? util.inspect(a, { depth: 5 }) : a))),
  // morgan stream compatibility
  stream: {
    write: (message) => console.log(message.trim())
  }
};

module.exports = logger;
