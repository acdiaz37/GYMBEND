"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
}

export function IconButton({
  icon: Icon,
  onClick,
  className,
  iconClassName,
}: IconButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full",
        className
      )}
    >
      <Icon className={cn("w-5 h-5 text-white", iconClassName)} strokeWidth={1.5} />
    </motion.button>
  );
}
