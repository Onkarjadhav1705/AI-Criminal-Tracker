import { createContext, useContext, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { api } from "../api/client";
import type { Role, User } from "../types/domain";

type AuthState = {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles?: Role[]) => boolean;
};

const AuthContext = createContext<AuthState | null>(null);

const storedUser = localStorage.getItem("cni_user");

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(storedUser ? (JSON.parse(storedUser) as User) : null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("cni_token"));

  const value = useMemo<AuthState>(
    () => ({
      user,
      token,
      async login(username, password) {
        const result = await api.login(username, password);
        setUser(result.user);
        setToken(result.access_token);
        localStorage.setItem("cni_user", JSON.stringify(result.user));
        localStorage.setItem("cni_token", result.access_token);
      },
      logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem("cni_user");
        localStorage.removeItem("cni_token");
      },
      hasRole(roles) {
        if (!roles?.length) return Boolean(user);
        return Boolean(user?.roles.some((role) => roles.includes(role)));
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
