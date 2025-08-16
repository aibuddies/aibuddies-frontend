"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { api, setAuthToken } from "@/lib/api";

type User = {
  id: string;
  fullname: string;
  email: string;
  credits: number;
  is_verified: boolean;
};

type Ctx = {
  user: User | null;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<Ctx>({
  user: null,
  refreshUser: async () => {},
  logout: () => {},
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = async () => {
    try {
      const res = await api.get("/api/users/me");
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const token = Cookies.get("aib_token") || null;
    setAuthToken(token);
    if (token) refreshUser();
  }, []);

  const logout = () => {
    Cookies.remove("aib_token");
    setAuthToken(null);
    setUser(null);
    if (typeof window !== "undefined") window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
