import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import React, { useState, useEffect } from 'react';

//Vidi dali tuka treba jwt da se implementira
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [localUser, setLocalUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    try {
      const userFromStorage = localStorage.getItem('user');
      if (userFromStorage) {
        setLocalUser(JSON.parse(userFromStorage));
      }
    } catch (err) {
      console.error('Error reading from localStorage:', err);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Show loading spinner while checking auth
  if (loading || isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
  console.log('User from context:', user);
  console.log('User from localStorage:', localUser);

  if (!user && !localUser) {
    console.log('Not authenticated, redirecting to login');
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // If we get here, we're authenticated
  return children;
};

export default ProtectedRoute;
