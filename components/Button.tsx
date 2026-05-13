"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary";
}

export function Button({
  children,
  onClick,
  className,
  variant = "primary",
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "w-full py-4 rounded-3xl font-bold uppercase tracking-wide text-sm transition-colors",
        variant === "primary"
          ? "bg-accent-blue text-white"
          : "bg-white/10 text-white",
        className
      )}
    >
      {children}
    </motion.button>
  );
}
