"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { api, setAuthToken } from "@/lib/api";

type User = { id: string; fullname: string; email: string; credits: number; is_verified: boolean } | null;

const Ctx = createContext<{ user: User; refreshUser: () => Promise<void>; }>(
  { user: null, refreshUser: async () => {} }
);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  const refreshUser = async () => {
    try {
      const token = Cookies.get("aib_token");
      setAuthToken(token || null);
      if (!token) { setUser(null); return; }
      const res = await api.get("/api/users/me");
      setUser(res.data);
    } catch { setUser(null); }
  };

  useEffect(() => { refreshUser(); }, []);

  return (
    <Ctx.Provider value={{ user, refreshUser }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
