"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FloatingDockItem {
  title: string;
  icon: React.ReactNode;
  href: string;
}

export const FloatingDock = ({ items, className }: { items: FloatingDockItem[], className?: string }) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className={cn("fixed bottom-8 left-1/2 -translate-x-1/2 z-50", className)}>
      <motion.div 
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-end gap-3 px-3 pb-3 pt-3 rounded-2xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.5 }}
      >
        {items.map((item, idx) => (
          <DockIcon key={idx} item={item} mouseX={mouseX} />
        ))}
      </motion.div>
    </div>
  );
};

function DockIcon({ item, mouseX }: { item: FloatingDockItem, mouseX: MotionValue }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate distance from mouse to the center of the icon
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Scale based on distance
  const scaleSync = useTransform(distance, [-150, 0, 150], [1, 1.5, 1]);
  const widthSync = useTransform(distance, [-150, 0, 150], [48, 72, 48]);
  const heightSync = useTransform(distance, [-150, 0, 150], [48, 72, 48]);

  // Apply spring physics for smooth magnification
  const scale = useSpring(scaleSync, { mass: 0.1, stiffness: 150, damping: 12 });
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });
  const height = useSpring(heightSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <Link href={item.href}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex items-center justify-center rounded-xl bg-white/5 text-white/70 hover:text-white transition-colors"
      >
        <motion.div style={{ scale }} className="flex items-center justify-center w-full h-full">
          {item.icon}
        </motion.div>

        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 2, scale: 0.8 }}
              className="absolute -top-12 px-3 py-1.5 rounded-lg bg-[#111] border border-white/10 text-xs font-medium text-white shadow-xl whitespace-nowrap pointer-events-none"
            >
              {item.title}
              {/* Tooltip triangle */}
              <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 border-[5px] border-transparent border-t-[#111]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}
