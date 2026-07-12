"use client";

import React, { useState, useEffect } from "react";
import { Search, Menu } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/Badge";

export function Topbar({ setMobileOpen }: { setMobileOpen: (v: boolean) => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("search", val);
    } else {
      params.delete("search");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  if (!user) return null;

  return (
    <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden text-white" onClick={() => setMobileOpen(true)}>
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="relative hidden md:block w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={handleSearch}
            className="h-10 w-full rounded-full border border-[var(--border-strong)] bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-auto">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-white">{user.name}</span>
          </div>
          <Badge variant="accent" className="hidden md:inline-flex">{user.role.replace("_", " ")}</Badge>
        </div>
      </div>
    </header>
  );
}
