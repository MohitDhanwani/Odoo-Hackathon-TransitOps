import React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading,
  emptyMessage = "No records found.",
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]", className)}>
      <table className="w-full text-left text-sm text-[var(--text-secondary)]">
        <thead className="bg-white/5 text-xs uppercase tracking-wider text-[var(--text-muted)]">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4 font-semibold whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {columns.map((col, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 bg-white/5 rounded-md w-2/3"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-[var(--text-muted)]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-white/5 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                    {col.cell ? col.cell(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
