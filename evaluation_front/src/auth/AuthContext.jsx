import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);
const STORAGE_KEY = "eval.auth.session.v1";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // ✅ Axios global config
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          logout();
          window.location.href = "/login";
        }
        return Promise.reject(err);
      },
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  async function login({ email, password }) {
    const tokenRes = await axios.post(
      "http://localhost:8000/account/auth/login/",
      { email, password },
    );

    const { access, refresh } = tokenRes.data;

    const userRes = await axios.get("http://localhost:8000/account/auth/me/", {
      headers: { Authorization: `Bearer ${access}` },
    });

    const nextSession = {
      user: userRes.data, // must include role
      token: access,
      refresh: refresh,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);

    return nextSession;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session?.token),
      login,
      logout,
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
