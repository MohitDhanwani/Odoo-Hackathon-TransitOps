"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "pointer-events-auto w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]",
                className
              )}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] shrink-0">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-[var(--text-secondary)] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
