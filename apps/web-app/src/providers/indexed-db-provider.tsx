"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo } from "react";

import { IndexedDBService } from "../services/indexed-db";

const IndexedDBContext = createContext<IndexedDBService | null>(null);

interface IndexedDBProviderProps {
  children: ReactNode;
}

export function IndexedDBProvider({ children }: IndexedDBProviderProps) {
  const dbRef = useMemo<IndexedDBService>(() => new IndexedDBService(), []);

  useEffect(() => {
    void dbRef.initialize();

    return () => {
      dbRef.close();
    };
  }, [dbRef]);

  return (
    <IndexedDBContext.Provider value={dbRef}>
      {children}
    </IndexedDBContext.Provider>
  );
}

export function useIndexedDB() {
  const db = useContext(IndexedDBContext);

  if (!db) {
    throw new Error("useIndexedDB must be used within IndexedDBProvider");
  }

  return db;
}
