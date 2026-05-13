"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Dumbbell, ListPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: Dumbbell },
  { href: "/builder", label: "Builder", icon: ListPlus },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="shrink-0 flex items-center justify-around px-2 pb-safe pt-2 bg-black/80 backdrop-blur-md border-t border-separator z-50">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-colors",
              isActive ? "text-white" : "text-gray-subtitle"
            )}
          >
            <tab.icon
              className={cn("w-6 h-6", isActive ? "text-white" : "text-gray-subtitle")}
              strokeWidth={1.5}
            />
            <span className="text-[10px] font-medium uppercase tracking-wide">
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className="absolute bottom-1 w-1 h-1 rounded-full bg-accent-blue"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
