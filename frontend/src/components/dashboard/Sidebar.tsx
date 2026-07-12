"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Wrench,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["fleet_manager", "dispatcher", "safety_officer", "financial_analyst"] },
  { label: "Trips", href: "/trips", icon: MapPin, roles: ["dispatcher"] },
  { label: "Fleet", href: "/fleet", icon: Truck, roles: ["fleet_manager"] },
  { label: "Drivers", href: "/drivers", icon: Users, roles: ["safety_officer"] },
  { label: "Maintenance", href: "/maintenance", icon: Wrench, roles: ["fleet_manager"] },
  { label: "Fuel & Expenses", href: "/fuel-expenses", icon: Receipt, roles: ["financial_analyst"] },
  { label: "Analytics", href: "/analytics", icon: BarChart3, roles: ["financial_analyst"] },
  { label: "Settings", href: "/settings", icon: Settings, roles: ["fleet_manager", "dispatcher", "safety_officer", "financial_analyst"] },
];

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const allowedItems = navItems.filter((item) => item.roles.includes(user.role));

  const content = (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] text-white w-64 shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tighter text-white">TransitOps</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
        </div>
        <button className="ml-auto md:hidden" onClick={() => setMobileOpen(false)}>
          <X className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1 custom-scrollbar">
        <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] px-3 mb-2">Main Menu</div>
        {allowedItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <span className="font-semibold text-sm">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{user.name}</span>
            <span className="text-xs text-[var(--text-muted)] truncate capitalize">{user.role.replace("_", " ")}</span>
          </div>
          <button
            onClick={logout}
            className="ml-auto p-2 text-[var(--text-secondary)] hover:text-white hover:bg-white/5 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:flex h-screen sticky top-0">
        {content}
      </div>
      
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 h-full flex transform transition-transform">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
