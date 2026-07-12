"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useRef, ReactNode } from "react";

export const TestimonialsMarquee = ({
  children,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  children: ReactNode[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    addAnimation();
  }, []);

  const [start, setStart] = useState(false);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      setStart(true);
    }
  }

  const durationStyle = speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s";
  const directionStyle = direction === "left" ? "normal" : "reverse";

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl mx-auto overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
        style={{
          animationDuration: durationStyle,
          animationDirection: directionStyle,
        }}
      >
        {children}
      </ul>
    </div>
  );
};
