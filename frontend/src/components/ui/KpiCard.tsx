"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function KpiCard({
  title,
  value,
  trend,
  className,
}: {
  title: string;
  value: string | number;
  trend?: { label: string; positive: boolean };
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 flex flex-col gap-2",
        className
      )}
    >
      <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        {title}
      </h4>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-md mb-1",
              trend.positive
                ? "bg-[var(--success)]/10 text-[var(--success)]"
                : "bg-[var(--danger)]/10 text-[var(--danger)]"
            )}
          >
            {trend.label}
          </span>
        )}
      </div>
    </motion.div>
  );
}
