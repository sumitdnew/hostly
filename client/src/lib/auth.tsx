import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { apiRequest, setAuthToken, queryClient } from "./queryClient";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  orgId: string;
}

interface AuthOrg {
  id: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  org: AuthOrg | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, orgName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function readToken(): string | null {
  try {
    return window.__HOSTLY_AUTH_TOKEN__;
  } catch {
    return null;
  }
}

function readRefreshToken(): string | null {
  try {
    return window.__HOSTLY_REFRESH_TOKEN__;
  } catch {
    return null;
  }
}

function storeRefreshToken(token: string | null) {
  window.__HOSTLY_REFRESH_TOKEN__ = token;
}

// Extend window type
declare global {
  interface Window {
    __HOSTLY_REFRESH_TOKEN__: string | null;
  }
}
window.__HOSTLY_REFRESH_TOKEN__ = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [org, setOrg] = useState<AuthOrg | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check if we have a stored token
  useEffect(() => {
    const token = readToken();
    if (token) {
      setAuthToken(token);
      fetch(("__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__") + "/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => {
          if (r.ok) return r.json();
          // Token expired — try refresh
          const refreshToken = readRefreshToken();
          if (refreshToken) {
            return fetch(("__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__") + "/api/auth/refresh", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            }).then(rr => {
              if (rr.ok) return rr.json().then(refreshData => {
                setAuthToken(refreshData.token);
                storeRefreshToken(refreshData.refreshToken);
                // Retry /me with new token
                return fetch(("__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__") + "/api/auth/me", {
                  headers: { Authorization: `Bearer ${refreshData.token}` },
                }).then(r2 => r2.ok ? r2.json() : null);
              });
              return null;
            });
          }
          return null;
        })
        .then((data) => {
          if (data?.user) {
            setUser(data.user);
            setOrg(data.org);
          } else {
            setAuthToken(null);
            storeRefreshToken(null);
          }
        })
        .catch(() => {
          setAuthToken(null);
          storeRefreshToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await res.json();
    setAuthToken(data.token);
    storeRefreshToken(data.refreshToken || null);
    setUser(data.user);
    setOrg(data.org);
    queryClient.clear();
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, orgName: string) => {
    const res = await apiRequest("POST", "/api/auth/signup", { email, password, name, orgName });
    const data = await res.json();
    setAuthToken(data.token);
    storeRefreshToken(data.refreshToken || null);
    setUser(data.user);
    setOrg(data.org);
    queryClient.clear();
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
    } catch {}
    setAuthToken(null);
    storeRefreshToken(null);
    setUser(null);
    setOrg(null);
    queryClient.clear();
  }, []);

  return (
    <AuthContext.Provider value={{ user, org, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
