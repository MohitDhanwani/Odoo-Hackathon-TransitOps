import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.02]",
          {
            "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:shadow-[0_0_24px_var(--accent-glow)] border border-transparent":
              variant === "primary",
            "bg-white/5 backdrop-blur-md border border-[var(--border-strong)] text-white hover:bg-white/10":
              variant === "secondary",
            "bg-transparent text-[var(--text-secondary)] hover:text-white hover:bg-white/5":
              variant === "ghost",
            "bg-[var(--danger)] text-white hover:bg-red-600 border border-transparent":
              variant === "danger",
            "h-8 px-4 text-xs": size === "sm",
            "h-10 px-6 text-sm": size === "md",
            "h-12 px-8 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
