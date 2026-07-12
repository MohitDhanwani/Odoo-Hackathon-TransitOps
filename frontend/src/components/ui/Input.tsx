import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const inputId = id || props.name;
    
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[var(--danger)] focus:ring-[var(--danger)] focus:border-[var(--danger)]",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
