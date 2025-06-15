import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'supabase-auth-token',
    storage: localStorage,
    autoRefreshToken: true,
  },
});

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // Use refs for mutable values that shouldn't trigger re-renders
  const inactivityTimeoutRef = useRef(null);
  const isActiveRef = useRef(false);
  const userRef = useRef(null); // Store user ID in ref to avoid dependency cycle
  const navigate = useNavigate();

  // 2 minutes timeout (in milliseconds)
  const INACTIVITY_TIMEOUT = 2 * 60 * 1000;

  // Update userRef when user changes
  useEffect(() => {
    userRef.current = user?.id || null;

    // Debug log only once when user changes
    if (import.meta.env.DEV && user) {
      console.log(
        `Inactivity timeout set for ${INACTIVITY_TIMEOUT / 1000} seconds`
      );
    }
  }, [user, INACTIVITY_TIMEOUT]);

  // Function to logout - using userRef instead of user state
  const logout = useCallback(async () => {
    try {
      console.log(
        'Logging out user due to:',
        isActiveRef.current ? 'manual logout' : 'inactivity'
      );
      setIsLoggingOut(true);

      // Clear the timeout to prevent duplicate logouts
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }

      // Remove data first to prevent race conditions
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      localStorage.removeItem('lastActivityTimestamp');

      // Call signOut only once
      await supabase.auth.signOut();

      // Update state
      setUser(null);
      userRef.current = null;

      // Navigate to home page
      navigate('/');

      // Reset logout flag after navigation
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 1000);
    } catch (error) {
      console.error('Error during logout:', error);
      setIsLoggingOut(false);
    }
  }, [navigate]); // Remove user dependency

  // Function to reset inactivity timer - using userRef instead of user state
  const resetInactivityTimer = useCallback(() => {
    isActiveRef.current = true;

    // Clear existing timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }

    // Only set new timeout if we have a user (using ref)
    if (userRef.current) {
      // Update timestamp in localStorage, but limit frequency to avoid excessive writes
      const now = Date.now();
      const lastStoredTime = parseInt(
        localStorage.getItem('lastActivityTimestamp') || '0'
      );
      if (now - lastStoredTime > 10000) {
        // Only update every 10 seconds
        localStorage.setItem('lastActivityTimestamp', now.toString());

        // Debug log with reduced frequency
        if (import.meta.env.DEV) {
          const currentTime = new Date().toLocaleTimeString();
          console.debug(
            `[${currentTime}] Activity detected, resetting timeout`
          );
        }
      }

      inactivityTimeoutRef.current = setTimeout(() => {
        isActiveRef.current = false;
        console.warn('User inactive for 2 minutes, logging out...');
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [logout, INACTIVITY_TIMEOUT]); // Remove user dependency

  // Initial session check
  useEffect(() => {
    const checkStaleSession = () => {
      const storedUser = localStorage.getItem('user');
      const lastActivity = localStorage.getItem('lastActivityTimestamp');

      if (storedUser && lastActivity) {
        const inactiveTime = Date.now() - parseInt(lastActivity);

        if (inactiveTime > INACTIVITY_TIMEOUT) {
          console.log('Found stale session - logging out');
          localStorage.removeItem('user');
          localStorage.removeItem('lastActivityTimestamp');
          supabase.auth.signOut();
          navigate('/');
        }
      }
    };

    checkStaleSession();
  }, [navigate, INACTIVITY_TIMEOUT]);

  // Set up activity listeners - use a stable reference to avoid recreation
  useEffect(() => {
    // Only set up listeners if we have a user
    if (!userRef.current) return;

    // Debug log only once when setting up listeners
    if (import.meta.env.DEV) {
      console.log('Setting up activity listeners for inactivity timeout');
    }

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Make sure to debounce the activity handler to prevent excessive timer resets
    let debounceTimeout;
    const DEBOUNCE_DELAY = 1000; // 1 second

    const handleActivity = () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);

      debounceTimeout = setTimeout(() => {
        resetInactivityTimer();
      }, DEBOUNCE_DELAY);
    };

    // Add event listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Set initial timer when mounting
    resetInactivityTimer();

    // Visibility change detection (tab switching)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resetInactivityTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);

      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });

      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
    };
  }, [resetInactivityTimer]); // Only depend on the stable resetInactivityTimer

  // Initial auth and auth listener setup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          setUser(data.session.user);
          localStorage.setItem('jwt', data.session.access_token);
          // userRef will be updated via the user effect
        }
      } catch (error) {
        console.error('Error retrieving session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (import.meta.env.DEV && event !== 'TOKEN_REFRESHED') {
          console.log('Auth state changed:', event);
        }

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          localStorage.setItem('jwt', session.access_token);
          // userRef will be updated via the user effect
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('jwt');
          if (inactivityTimeoutRef.current) {
            clearTimeout(inactivityTimeoutRef.current);
            inactivityTimeoutRef.current = null;
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          localStorage.setItem('jwt', session.access_token);
          // Only reset timer if not logged out
          if (userRef.current) {
            resetInactivityTimer();
          }
        }
      }
    );

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [resetInactivityTimer]);

  const value = {
    user,
    loading,
    logout,
    resetInactivityTimer,
    isLoggingOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
