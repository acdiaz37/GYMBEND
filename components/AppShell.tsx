"use client";

import { motion } from "framer-motion";
import { BottomNav } from "./BottomNav";
import { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  header?: ReactNode;
  showNav?: boolean;
}

export function AppShell({ children, header, showNav = true }: AppShellProps) {
  return (
    <div className="flex flex-col h-full bg-black">
      {header}
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-1 overflow-y-auto no-scrollbar"
      >
        {children}
      </motion.main>
      {showNav && <BottomNav />}
    </div>
  );
}
