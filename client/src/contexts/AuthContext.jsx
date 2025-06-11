import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useCallback } from 'react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create the context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimeoutRef = useRef(null); // Use ref instead of state
  const navigate = useNavigate();

  // Inactivity duration in milliseconds (30 minutes)
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

  // Function to handle logout - use useCallback to prevent recreation on every render
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('user');
      sessionStorage.clear();
      setUser(null);
      navigate('/login?reason=inactivity');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [navigate]);

  // Function to reset the inactivity timer - use useCallback
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    // Only set timer if user is logged in
    if (user) {
      inactivityTimeoutRef.current = setTimeout(() => {
        console.log('User inactive for too long, logging out...');
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [logout, INACTIVITY_TIMEOUT, user]);

  // Set up event listeners for user activity
  useEffect(() => {
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];

    const handleActivity = () => {
      if (user) {
        localStorage.setItem('lastActivityTimestamp', Date.now().toString());
        resetInactivityTimer();
      }
    };

    // Add event listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timer setup if user exists
    if (user) {
      resetInactivityTimer();
    }

    // Cleanup
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }

      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [resetInactivityTimer, user]); // Depend on both resetInactivityTimer and user

  // Initialize user state from Supabase session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (data?.session?.user) {
          setUser(data.session.user);
        } else {
          // If no Supabase session, check localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Error retrieving session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          if (inactivityTimeoutRef.current) {
            clearTimeout(inactivityTimeoutRef.current);
            inactivityTimeoutRef.current = null;
          }
        }
      }
    );

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  useEffect(() => {
    const checkLastActivity = () => {
      const lastActivity = localStorage.getItem('lastActivityTimestamp');
      if (lastActivity && user) {
        const inactiveTime = Date.now() - parseInt(lastActivity);
        if (inactiveTime > INACTIVITY_TIMEOUT) {
          console.log('Detected inactivity between sessions');
          logout();
        }
      }
    };

    if (user) {
      checkLastActivity();
    }
  }, [user, logout, INACTIVITY_TIMEOUT]);

  // Auth context value
  const value = {
    user,
    loading,
    logout,
    resetInactivityTimer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
