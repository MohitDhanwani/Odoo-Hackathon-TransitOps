import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "accent" | "muted";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-widest border",
        {
          "bg-white/10 text-white border-white/20": variant === "default",
          "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20": variant === "success",
          "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20": variant === "warning",
          "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20": variant === "danger",
          "bg-[var(--info)]/10 text-[var(--info)] border-[var(--info)]/20": variant === "info",
          "bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]/20": variant === "accent",
          "bg-transparent text-[var(--text-muted)] border-[var(--border-strong)]": variant === "muted",
        },
        className
      )}
      {...props}
    />
  );
}

export function StatusPill({ status, className }: { status: string; className?: string }) {
  let variant: BadgeProps["variant"] = "default";
  
  switch (status.toLowerCase()) {
    case "available":
    case "completed":
      variant = "success";
      break;
    case "on_trip":
      variant = "info";
      break;
    case "in_shop":
      variant = "warning";
      break;
    case "retired":
    case "suspended":
    case "cancelled":
      variant = "danger";
      break;
    case "draft":
      variant = "muted";
      break;
    case "dispatched":
      variant = "accent";
      break;
  }

  return (
    <Badge variant={variant} className={className}>
      {status.replace("_", " ")}
    </Badge>
  );
}
