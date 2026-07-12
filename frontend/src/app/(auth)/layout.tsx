import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--bg-base)]">
      {/* Subtle static gradient glow behind */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent)] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black tracking-tighter text-white">TransitOps</span>
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
