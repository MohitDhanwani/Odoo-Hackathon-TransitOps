import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, id, children, ...props }, ref) => {
    const selectId = id || props.name;
    
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "flex h-10 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 pr-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
              error && "border-[var(--danger)] focus:ring-[var(--danger)] focus:border-[var(--danger)]",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
        {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";
