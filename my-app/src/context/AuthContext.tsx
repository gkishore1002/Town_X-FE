import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { authAPI, type LoginPayload, type SignupPayload } from "@/services/authAPI";
import type { User, UserRole } from "@/types/user";

const TOKEN_KEY = "townx_token";
const USER_KEY = "townx_user";

/** Where each role lands right after login/signup. */
export const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  buyer: "/",
  owner: "/owner/dashboard",
  admin: "/admin/dashboard",
};

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  signup: (payload: SignupPayload) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  // Simplified session model (see Town_X-BE/auth.py docstring): trust the
  // locally-cached user immediately for a fast paint, then quietly confirm
  // the token is still valid against /api/auth/me. If it's expired/invalid,
  // sign out rather than leaving a stale "logged in" UI.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    authAPI
      .me()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persistSession = (accessToken: string, nextUser: User) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const login = async (payload: LoginPayload) => {
    const result = await authAPI.login(payload);
    persistSession(result.access_token, result.user);
    return result.user;
  };

  const signup = async (payload: SignupPayload) => {
    const result = await authAPI.signup(payload);
    persistSession(result.access_token, result.user);
    return result.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, isLoading, login, signup, logout }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
