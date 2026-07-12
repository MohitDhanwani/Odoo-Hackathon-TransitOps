"use client";

import React from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster 
        theme="dark" 
        position="bottom-right" 
        toastOptions={{ 
          style: { 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border-strong)', 
            color: '#fff' 
          } 
        }} 
      />
    </AuthProvider>
  );
}
