"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ListItemProps {
  image?: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ListItem({
  image,
  title,
  subtitle,
  right,
  onClick,
  className,
}: ListItemProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center w-full px-6 py-3 gap-4 text-left",
        className
      )}
    >
      {image && (
        <div className="shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
          {image}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-base truncate">{title}</p>
        {subtitle && (
          <p className="text-gray-subtitle text-sm truncate">{subtitle}</p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </motion.button>
  );
}
