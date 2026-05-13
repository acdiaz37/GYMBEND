"use client";

import { createContext, useContext, ReactNode } from "react";
import { StorageProvider } from "@/lib/storage/provider";
import { storageProvider } from "@/lib/storage/local-provider";

const StorageContext = createContext<StorageProvider>(storageProvider);

export function useStorage() {
  return useContext(StorageContext);
}

export function StorageProviderClient({ children }: { children: ReactNode }) {
  return (
    <StorageContext.Provider value={storageProvider}>
      {children}
    </StorageContext.Provider>
  );
}
