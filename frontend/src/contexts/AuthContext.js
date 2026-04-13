import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

// Token storage — uses sessionStorage (clears on tab close) to reduce
// XSS exposure window vs localStorage. Not a replacement for httpOnly
// cookies, but the K8s ingress rewrites Access-Control-Allow-Origin to
// wildcard which blocks credentialed cookie requests.
const tokenStore = {
  get: (key) => sessionStorage.getItem(key),
  set: (key, val) => sessionStorage.setItem(key, val),
  remove: (key) => sessionStorage.removeItem(key),
  clearAll() {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
  },
};

// Axios instance with auth interceptor
const authAxios = axios.create();
authAxios.interceptors.request.use((config) => {
  const token = tokenStore.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { authAxios };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = not auth
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = tokenStore.get("access_token");
    if (!token) {
      setUser(false);
      setLoading(false);
      return;
    }
    try {
      const { data } = await authAxios.get(`${API}/auth/me`);
      setUser(data);
    } catch (error) {
      console.error("Auth check failed:", error);
      tokenStore.clearAll();
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password });
      tokenStore.set("access_token", data.access_token);
      tokenStore.set("refresh_token", data.refresh_token);
      setUser({ _id: data._id, email: data.email, name: data.name, role: data.role });
      return { success: true };
    } catch (e) {
      return { success: false, error: formatApiErrorDetail(e.response?.data?.detail) || e.message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const { data } = await axios.post(`${API}/auth/register`, { name, email, password });
      tokenStore.set("access_token", data.access_token);
      tokenStore.set("refresh_token", data.refresh_token);
      setUser({ _id: data._id, email: data.email, name: data.name, role: data.role });
      return { success: true };
    } catch (e) {
      return { success: false, error: formatApiErrorDetail(e.response?.data?.detail) || e.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAxios.post(`${API}/auth/logout`);
    } catch (error) {
      console.error("Logout request failed:", error);
    }
    tokenStore.clearAll();
    setUser(false);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, checkAuth }),
    [user, loading, login, register, logout, checkAuth]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
