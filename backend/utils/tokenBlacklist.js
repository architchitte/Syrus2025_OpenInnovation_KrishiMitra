// Very small in-memory blacklist. For production use Redis or another shared store.
const blacklist = new Map();

function add(token, ttlMs = 1000 * 60 * 60 * 24) { // default 24 hours
  const expiresAt = Date.now() + ttlMs;
  blacklist.set(token, expiresAt);
}

function has(token) {
  const expiresAt = blacklist.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    blacklist.delete(token);
    return false;
  }
  return true;
}

module.exports = { add, has };
