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

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "supabase-auth-token",
      storage: localStorage,
    },
  }
);

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const INACTIVITY_TIMEOUT = 120 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimeoutRef = useRef(null);
  const tokenExpiryTimeoutRef = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    clearTimeout(inactivityTimeoutRef.current);
    clearTimeout(tokenExpiryTimeoutRef.current);
    navigate("/");
    await supabase.auth.signOut();

    localStorage.removeItem("user");
    localStorage.removeItem("jwt");
    localStorage.removeItem("lastActivityTimestamp");
    setUser(null);
    userRef.current = null;
  }, [navigate]);
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
  const resetInactivityTimer = useCallback(() => {
    const now = Date.now();
    localStorage.setItem("lastActivityTimestamp", Date.now().toString());
    clearTimeout(inactivityTimeoutRef.current);
    if (userRef.current) {
      inactivityTimeoutRef.current = setTimeout(() => {
        console.warn("Logged out due to inactivity");
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [logout]);

  const login = useCallback(
    async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.session?.access_token) {
        return { success: false, error: error?.message || "Login failed" };
      }

      const backendData = await loginUser({ email });
      if (!backendData.success) {
        await supabase.auth.signOut();
        return { success: false, error: backendData.message };
      }

      setUser(backendData.user);
      userRef.current = backendData.user.id;
      localStorage.setItem("user", JSON.stringify(backendData.user));
      localStorage.setItem("jwt", data.session.access_token);
      resetInactivityTimer();
      return { success: true };
    },
    [resetInactivityTimer]
  );

  const register = useCallback(
    async (userData) => {
      try {
        const response = await registerUser(userData);

        if (response.success) {
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email: userData.email,
              password: userData.password,
            });

          if (signInError) {
            return { success: false, error: signInError.message };
          }
          return { success: true, user: signInData.user };
        } else {
          return {
            success: false,
            error: response.data.message,
            errors: response.data.errors,
          };
        }
      } catch (error) {
        if (error.response && error.response.data) {
          return {
            success: false,
            error: error.response.data.message,
            errors: error.response.data.errors,
          };
        } else {
          return {
            success: false,
            error: "An unexpected network error occurred.",
          };
        }
      }
    },
    [resetInactivityTimer]
  );

  useEffect(() => {
    setLoading(true);
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(event);
        if (event === "TOKEN_REFRESHED" && session) {
          const now = Date.now();
          const readableTime = new Date(now).toLocaleString();
          console.log(`Token reset at: ${readableTime}`);

          localStorage.setItem("jwt", session.access_token);

          return;
        }
        if (session) {
          const backendData = await loginUser({ email: session.user.email });
          if (backendData.success) {
            setUser(backendData.user);
            userRef.current = backendData.user.id;
            localStorage.setItem("user", JSON.stringify(backendData.user));
            localStorage.setItem("jwt", session.access_token);
            if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
              resetInactivityTimer();
            }
          } else {
            await supabase.auth.signOut();
          }
        } else {
          setUser(null);
          userRef.current = null;
          localStorage.removeItem("user");
          localStorage.removeItem("jwt");
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const events = ["click", "mousemove", "keydown", "scroll", "touchstart"];
    const handleActivity = () => resetInactivityTimer();
    events.forEach((event) => window.addEventListener(event, handleActivity));
    return () =>
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
  }, [resetInactivityTimer]);

  const updateUser = useCallback((newUserData) => {
    setUser(newUserData);

    localStorage.setItem("user", JSON.stringify(newUserData));
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        resetInactivityTimer,

        loading,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
