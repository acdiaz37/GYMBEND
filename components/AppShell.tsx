"use client";

import { BottomNav } from "./BottomNav";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { APP_VERSION } from "@/lib/version";

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
      {showNav && (
        <footer className="shrink-0 text-center py-1">
          <span className="text-[9px] font-medium uppercase tracking-widest text-gray-subtitle/60">
            v{APP_VERSION}
          </span>
        </footer>
      )}
      {showNav && <BottomNav />}
    </div>
  );
}
