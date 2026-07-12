"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

const roleAccess: Record<string, string[]> = {
  "/dashboard": ["fleet_manager", "dispatcher", "safety_officer", "financial_analyst"],
  "/fleet": ["fleet_manager"],
  "/drivers": ["safety_officer"],
  "/trips": ["dispatcher"],
  "/maintenance": ["fleet_manager"],
  "/fuel-expenses": ["financial_analyst"],
  "/analytics": ["financial_analyst"],
  "/settings": ["fleet_manager", "dispatcher", "safety_officer", "financial_analyst"],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && user) {
      // Check RBAC
      const allowedRoles = roleAccess[pathname] || [];
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
      </div>
    );
  }

  // Prevent flicker if unauthorized route is being blocked
  const allowedRoles = roleAccess[pathname] || [];
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null; 
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar setMobileOpen={setMobileOpen} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
