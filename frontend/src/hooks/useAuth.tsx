"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";

export type Role = "fleet_manager" | "dispatcher" | "safety_officer" | "financial_analyst";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        const data = await apiGet<User>("/auth/me");
        setUser(data);
        if (pathname === "/login") {
          router.push("/dashboard");
        }
      } catch (error) {
        setUser(null);
        if (pathname !== "/login" && pathname !== "/") {
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [pathname, router]);

  const logout = async () => {
    try {
      await apiPost("/auth/logout", {});
    } catch {
      // ignore
    }
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
