"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useStore } from "zustand";

import type { UploadQueueStore } from "../stores/upload-queue";
import { UploadQueueStatus } from "~/components/upload-queue-status";
import { UploadService } from "../services/upload-service";
import {
  createUploadQueueStore,
  defaultInitState,
} from "../stores/upload-queue";
import { useIndexedDB } from "./indexed-db-provider";

export type UploadQueueStoreApi = ReturnType<typeof createUploadQueueStore>;

export const UploadQueueStoreContext =
  createContext<UploadQueueStoreApi | null>(null);

export interface UploadQueueProviderProps {
  children: ReactNode;
}

export const UploadQueueProvider = ({ children }: UploadQueueProviderProps) => {
  const storeRef = useMemo(() => createUploadQueueStore(defaultInitState), []);

  const { getToken } = useAuth();
  const db = useIndexedDB();

  const serviceRef = useMemo(
    () =>
      new UploadService(storeRef, () => getToken({ template: "supabase" }), db),
    [storeRef, getToken, db],
  );
  // Initialize upload service
  useEffect(() => {
    // Start processing the queue if we're online
    if (navigator.onLine) {
      serviceRef.startProcessing();
    }

    return () => {
      serviceRef.cleanup();
    };
  }, [serviceRef]);

  return (
    <UploadQueueStoreContext.Provider value={storeRef}>
      {children}
      <UploadQueueStatus />
    </UploadQueueStoreContext.Provider>
  );
};

export const useUploadQueue = <T,>(
  selector: (store: UploadQueueStore) => T,
): T => {
  const store = useContext(UploadQueueStoreContext);

  if (!store) {
    throw new Error("useUploadQueue must be used within UploadQueueProvider");
  }

  return useStore(store, selector);
};
