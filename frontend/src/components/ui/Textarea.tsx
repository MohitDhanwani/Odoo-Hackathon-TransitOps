import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const textareaId = id || props.name;
    
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "flex min-h-[80px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
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
Textarea.displayName = "Textarea";
