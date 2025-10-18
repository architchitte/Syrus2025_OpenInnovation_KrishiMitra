// Small helpers to work with JWT stored in localStorage under 'token'
export function getToken() {
  return localStorage.getItem('token');
}

export function clearToken() {
  localStorage.removeItem('token');
}

// Try to parse JWT payload and extract role if present
export function getUserRole() {
  const token = getToken();
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.role || payload && payload.role;
  } catch (e) {
    return null;
  }
}
