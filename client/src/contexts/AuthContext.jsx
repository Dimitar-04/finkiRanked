import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: "supabase-auth-token",
    storage: localStorage,
    autoRefreshToken: true,
  },
});

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = decodeURIComponent(
      atob(base64Url)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(base64);
  } catch (e) {
    return null;
  }
}

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const inactivityTimeoutRef = useRef(null);
  const tokenExpiryTimeoutRef = useRef(null);
  const isActiveRef = useRef(false);
  const userRef = useRef(null);
  const navigate = useNavigate();

  const INACTIVITY_TIMEOUT = 120 * 60 * 1000;

  useEffect(() => {
    userRef.current = user?.id || null;
  }, [user]);

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true);

      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
      if (tokenExpiryTimeoutRef.current) {
        clearTimeout(tokenExpiryTimeoutRef.current);
        tokenExpiryTimeoutRef.current = null;
      }

      localStorage.removeItem("lastActivityTimestamp");
      localStorage.removeItem("jwt");
      localStorage.removeItem("token_exp");
      localStorage.removeItem("user");

      await supabase.auth.signOut();
      setUser(null);
      userRef.current = null;
      navigate("/");

      setTimeout(() => setIsLoggingOut(false), 1000);
    } catch (error) {
      console.error("Error during logout:", error);
      setIsLoggingOut(false);
    }
  }, [navigate]);

  const resetInactivityTimer = useCallback(() => {
    isActiveRef.current = true;
    localStorage.setItem("lastActivityTimestamp", Date.now().toString());

    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    if (userRef.current) {
      inactivityTimeoutRef.current = setTimeout(() => {
        isActiveRef.current = false;
        console.warn("User inactive, logging out");
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [logout]);

  useEffect(() => {
    const checkStaleSession = () => {
      const storedUser = localStorage.getItem("user");
      const lastActivity = localStorage.getItem("lastActivityTimestamp");

      if (storedUser && lastActivity) {
        const inactiveTime = Date.now() - parseInt(lastActivity);

        if (inactiveTime > INACTIVITY_TIMEOUT) {
          logout();
        }
      }
    };

    checkStaleSession();
  }, [navigate, INACTIVITY_TIMEOUT]);

  const setupTokenExpiryLogout = useCallback(
    (accessToken) => {
      if (!accessToken) return;

      const payload = parseJwt(accessToken);
      if (!payload?.exp) return;

      const now = Math.floor(Date.now() / 1000);
      const expiresIn = payload.exp - now;

      if (expiresIn <= 0) {
        console.warn("Token already expired, handling expiration");

        const lastActivity = parseInt(
          localStorage.getItem("lastActivityTimestamp") || "0",
          10
        );
        const inactiveDuration = Date.now() - lastActivity;

        if (inactiveDuration > INACTIVITY_TIMEOUT) {
          logout();
        } else {
          supabase.auth
            .refreshSession()
            .then(({ data, error }) => {
              if (error) {
                console.error("Token refresh failed:", error);
                logout();
              } else if (data?.session?.access_token) {
                localStorage.setItem("jwt", data.session.access_token);
                setupTokenExpiryLogout(data.session.access_token);
              }
            })
            .catch((err) => {
              console.error("Refresh failed:", err);
              logout();
            });
        }
      } else {
        localStorage.setItem("token_exp", payload.exp.toString());

        if (tokenExpiryTimeoutRef.current) {
          clearTimeout(tokenExpiryTimeoutRef.current);
        }

        tokenExpiryTimeoutRef.current = setTimeout(() => {
          setupTokenExpiryLogout(accessToken);
        }, expiresIn * 1000);
      }
    },
    [logout]
  );

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (session?.user) {
          setUser(session.user);
          localStorage.setItem("jwt", session.access_token);
          setupTokenExpiryLogout(session.access_token);
        }
      } catch (error) {
        console.error("Error retrieving session:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);

          localStorage.setItem("jwt", session.access_token);
          setupTokenExpiryLogout(session.access_token);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          localStorage.removeItem("jwt");

          if (inactivityTimeoutRef.current) {
            clearTimeout(inactivityTimeoutRef.current);
            inactivityTimeoutRef.current = null;
          }
          if (tokenExpiryTimeoutRef.current) {
            clearTimeout(tokenExpiryTimeoutRef.current);
            tokenExpiryTimeoutRef.current = null;
          }
        } else if (event === "TOKEN_REFRESHED" && session) {
          localStorage.setItem("jwt", session.access_token);
          setupTokenExpiryLogout(session.access_token);
        }
      }
    );

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [setupTokenExpiryLogout]);

  useEffect(() => {
    if (!user) return;

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    resetInactivityTimer();

    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [resetInactivityTimer, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        resetInactivityTimer,
        isLoggingOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
