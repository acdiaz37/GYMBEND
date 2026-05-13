"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

const VERSION_KEY = "gymbend-version";
const POLL_INTERVAL = 30000; // 30 seconds

export function VersionCheck() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        const serverVersion = String(data.version);
        const localVersion = localStorage.getItem(VERSION_KEY);

        if (localVersion && localVersion !== serverVersion) {
          setShowUpdate(true);
        } else {
          localStorage.setItem(VERSION_KEY, serverVersion);
        }
      } catch {
        // ignore network errors
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-48px)] max-w-sm">
      <button
        onClick={handleReload}
        className="flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-2xl bg-accent-blue text-white font-semibold text-sm shadow-lg shadow-accent-blue/30 active:scale-[0.98] transition-transform"
      >
        <RefreshCw className="w-4 h-4" strokeWidth={2} />
        Update available — Tap to reload
      </button>
    </div>
  );
}
