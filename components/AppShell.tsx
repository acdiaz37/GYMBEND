"use client";

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
      <main
        className={cn(
          "flex-1 overflow-y-auto no-scrollbar animate-fade-in",
          mainClassName
        )}
      >
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
