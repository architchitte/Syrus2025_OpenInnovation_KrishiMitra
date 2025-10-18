import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserRole } from '../../utils/authHelpers';

// requiredRole can be 'farmer' or 'consumer' or undefined for any authenticated user
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;

  // If there's no user object, check token as a fallback — redirect to login
  const token = localStorage.getItem('token');
  if (!user && !token) return <Navigate to="/login" replace />;

  if (requiredRole) {
    // Prefer role from AuthContext user, fallback to token parsing
    const role = user?.role || getUserRole();
    if (role !== requiredRole) return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
