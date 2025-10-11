// Simple in-memory TTL cache. For production use Redis or similar.
const store = new Map();

function set(key, value, ttlMs = 1000 * 60) { // default 60s
  const expiresAt = Date.now() + ttlMs;
  store.set(key, { value, expiresAt });
}

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

function del(key) {
  store.delete(key);
}

module.exports = { set, get, del };
