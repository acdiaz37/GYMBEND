"use client";

import { createContext, useContext, ReactNode, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { FirebaseStorageProvider } from "@/lib/storage/firebase-provider";
import { migrateLocalStorageToFirebase } from "@/lib/storage/migration";
import { StorageProvider } from "@/lib/storage/provider";
import { storageProvider } from "@/lib/storage/local-provider";

const StorageContext = createContext<StorageProvider>(storageProvider);

export function useStorage() {
  return useContext(StorageContext);
}

export function StorageProviderClient({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationError, setMigrationError] = useState(false);

  const provider = useMemo<StorageProvider>(() => {
    return user ? new FirebaseStorageProvider(user.uid) : storageProvider;
  }, [user]);

  useEffect(() => {
    if (!user || loading) return;

    let isMounted = true;
    setIsMigrating(true);
    setMigrationError(false);

    migrateLocalStorageToFirebase(user.uid)
      .catch(() => {
        if (isMounted) setMigrationError(true);
      })
      .finally(() => {
        if (isMounted) setIsMigrating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [loading, user]);

  return (
    <StorageContext.Provider value={provider}>
      {children}
      {(loading || isMigrating || migrationError) && (
        <div className="fixed left-1/2 top-4 z-[120] -translate-x-1/2 rounded-full bg-neutral-900/95 px-4 py-2 text-xs font-medium text-white shadow-lg border border-white/10">
          {loading
            ? "Checking session..."
            : isMigrating
              ? "Syncing local data..."
              : "Firebase sync needs attention"}
        </div>
      )}
    </StorageContext.Provider>
  );
}
