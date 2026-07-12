import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#020202] py-20 px-6 border-t border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="flex flex-col gap-4 max-w-sm">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black tracking-tighter text-white">TransitOps</span>
            <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Smart transport operations platform. Fleet operations, finally digitized. Built for the modern enterprise.
          </p>
        </div>
        <div className="flex gap-16">
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white">Product</h4>
            <Link href="#features" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">How it Works</Link>
            <Link href="/login" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Console</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white">Company</h4>
            <Link href="#" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">About</Link>
            <Link href="#" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Careers</Link>
            <Link href="#" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[var(--text-muted)]">© 2026 TransitOps. All rights reserved.</p>
        <p className="text-xs text-[var(--text-muted)]">Hackathon Project Demo</p>
      </div>
    </footer>
  );
}
