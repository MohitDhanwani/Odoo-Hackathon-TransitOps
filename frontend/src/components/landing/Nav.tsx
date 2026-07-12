import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl font-black tracking-tighter text-white">TransitOps</span>
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
      </div>
      <div className="hidden md:flex items-center gap-8">
        <Link href="#features" className="text-sm font-medium text-white hover:text-[var(--accent)] transition-colors">Features</Link>
        <Link href="#how-it-works" className="text-sm font-medium text-white hover:text-[var(--accent)] transition-colors">How it works</Link>
      </div>
      <div>
        <Link href="/login">
          <Button variant="primary" size="sm">Sign in to Console</Button>
        </Link>
      </div>
    </nav>
  );
}
