// src/context/AuthContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
  username?: string;
  name?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean; // <-- new
  login: (user: User, token?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // <-- new

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false); // <-- done loading
  }, []);

  const login = (user: User, token?: string) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    if (token) localStorage.setItem("token", token);

    window.dispatchEvent(new Event("auth-change"));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-change"));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
