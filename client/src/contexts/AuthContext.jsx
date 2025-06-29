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
import { loginUser, registerUser } from "@/services/registerLoginService";

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
const INACTIVITY_TIMEOUT = 120 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const inactivityTimeoutRef = useRef(null);
  const tokenExpiryTimeoutRef = useRef(null);
  const isActiveRef = useRef(false);
  const userRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    userRef.current = user?.id || null;
  }, [user]);

  const login = useCallback(async (email, password) => {
    try {
      const { data: supabaseAuthData, error: supabaseAuthError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (supabaseAuthError) {
        return { success: false, error: supabaseAuthError.message };
      }

      if (!supabaseAuthData.session?.access_token) {
        return {
          success: false,
          error: "Failed to retrieve session token from Supabase.",
        };
      }

      const backendLoginData = await loginUser({ email });

      if (backendLoginData.success) {
        setUser(backendLoginData.user);

        return { success: true };
      } else {
        await supabase.auth.signOut();
        return {
          success: false,
          error: backendLoginData.message || "Login failed on backend.",
        };
      }
    } catch (err) {
      console.error("Login error caught in AuthContext:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred during login.";
      return { success: false, error: message };
    }
  }, []);

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
      localStorage.removeItem("lastResetDate");
      localStorage.removeItem("user");

      await supabase.auth.signOut();

      localStorage.setItem("logout", "true");
      setTimeout(() => localStorage.removeItem("logout"), 1000);

      setUser(null);
      userRef.current = null;

      setTimeout(() => setIsLoggingOut(false), 500);
    } catch (error) {
      console.error("Error during logout:", error);
      setIsLoggingOut(false);
    }
  }, []);
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

  const register = useCallback(
    async (userData) => {
      try {
        const backendRegisterData = await registerUser(userData);
        if (!backendRegisterData.success) {
          return {
            success: false,
            error: backendRegisterData.message,
            errors: backendRegisterData.errors,
          };
        }
        const { data: supabaseAuthData, error: supabaseAuthError } =
          await supabase.auth.signInWithPassword({
            email: userData.email,
            password: userData.password,
          });
        if (supabaseAuthError) {
          console.error(
            "Supabase sign-in failed after registration:",
            supabaseAuthError
          );
          return {
            success: false,
            error:
              "Registration successful, but failed to create a session. Please try logging in.",
          };
        }
        setUser(backendRegisterData.user);
        localStorage.setItem("user", JSON.stringify(backendRegisterData.user));
        localStorage.setItem("jwt", supabaseAuthData.session.access_token);
        setupTokenExpiryLogout(supabaseAuthData.session.access_token);
        return { success: true };
      } catch (apiError) {
        console.error("Registration error caught in AuthContext:", apiError);
        const message =
          apiError.response?.data?.message ||
          "An unexpected error occurred during registration.";
        const errors = apiError.response?.data?.errors || null;
        return { success: false, error: message, errors: errors };
      }
    },
    [setupTokenExpiryLogout]
  );

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

  const updateUser = useCallback((newUserData) => {
    setUser(newUserData);

    localStorage.setItem("user", JSON.stringify(newUserData));
  }, []);

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

  useEffect(() => {
    console.log("AuthContext mounted");
    const initializeAndVerifyAuth = async () => {
      try {
        setIsVerifying(true);

        const storedUserJson = localStorage.getItem("user");
        if (storedUserJson) {
          setUser(JSON.parse(storedUserJson));
        }

        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (session?.user) {
          const backendLoginData = await loginUser({
            email: session.user.email,
          });

          if (backendLoginData.success) {
            setUser(backendLoginData.user);
            localStorage.setItem("user", JSON.stringify(backendLoginData.user));
          } else {
            logout();
            return;
          }

          localStorage.setItem("jwt", session.access_token);
          setupTokenExpiryLogout(session.access_token);
        } else if (storedUserJson) {
          logout();
        }
      } catch (error) {
        console.error("Error initializing/verifying auth:", error);
        logout();
      } finally {
        if (loading) {
          setLoading(false);
        }
        setIsVerifying(false);
      }
    };

    initializeAndVerifyAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session?.user) {
            initializeAndVerifyAuth();
          }
        }
        // } else if (event === "SIGNED_OUT") {
        //   logout();
        // }
      }
    );

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        initializeAndVerifyAuth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [logout, setupTokenExpiryLogout]);

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

  //Sync actions between tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "logout" && event.newValue === "true") {
        logout();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        resetInactivityTimer,
        isLoggingOut,
        isVerifying,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
