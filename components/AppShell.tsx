"use client";

import { motion } from "framer-motion";
import { BottomNav } from "./BottomNav";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  header?: ReactNode;
  showNav?: boolean;
  mainClassName?: string;
}

export function AppShell({ children, header, showNav = true, mainClassName }: AppShellProps) {
  return (
    <div className="flex flex-col h-full bg-black">
      {header}
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn("flex-1 overflow-y-auto no-scrollbar", mainClassName)}
      >
        {children}
      </motion.main>
      {showNav && <BottomNav />}
    </div>
  );
}
