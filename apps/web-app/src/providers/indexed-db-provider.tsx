"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Dexie from "dexie";

import type { DifficultyLevelEnum } from "@acme/db/schema";

import type { UploadItem } from "~/types/upload";

export interface IntakeFormAnalysis {
  id: string;
  kennelId: string | null;
  uploadedUrl: string;
  previewUrl: string;
  shelterId: string;
  roomId: string;
  analyzedData: {
    externalId?: string;
    name?: string;
    breed?: string;
    gender?: "male" | "female";
    difficultyLevel?: DifficultyLevelEnum;
    isFido?: boolean;
    generalNotes?: string;
    approvedActivities?: {
      activity?: string;
      isApproved?: boolean;
    }[];
    equipmentNotes?: {
      inKennel?: string;
      outOfKennel?: string;
    };
    staffLeashUp?: boolean;
    staffReturn?: boolean;
  } | null;
  status: "pending" | "analyzing" | "analyzed" | "error" | "editing";
  error?: string;
  createdAt: Date;
}

class AppDB extends Dexie {
  uploads!: Dexie.Table<UploadItem, string>;
  intakeForms!: Dexie.Table<IntakeFormAnalysis, string>;

  constructor() {
    super("shelter-buddy-db");
    this.version(1).stores({
      intakeForms: "id, kennelId, animalId, status, createdAt",
      uploads: "id, kennelId, status, createdAt",
    });
  }
}

export interface IndexedDBContextValue {
  db: AppDB | null;
  error: Error | null;
  // Upload Methods
  getAllUploads: () => Promise<UploadItem[]>;
  getUpload: (id: string) => Promise<UploadItem | undefined>;
  getUploadByKennelId: (kennelId: string) => Promise<UploadItem | null>;
  addUploads: (items: UploadItem[]) => Promise<void>;
  updateUpload: (id: string, updates: Partial<UploadItem>) => Promise<void>;
  removeUpload: (id: string) => Promise<void>;
  clearUploads: () => Promise<void>;
  getPendingUploads: () => Promise<UploadItem[]>;
  // Intake Form Methods
  getIntakeFormByKennelId: (
    kennelId: string,
  ) => Promise<IntakeFormAnalysis | null>;
  getIntakeFormByAnimalId: (
    animalId: string,
  ) => Promise<IntakeFormAnalysis | null>;
  getIntakeFormById: (id: string) => Promise<IntakeFormAnalysis | null>;
  saveIntakeForm: (form: IntakeFormAnalysis) => Promise<void>;
  removeIntakeForm: (id: string) => Promise<void>;
  assignIntakeFormToKennel: (formId: string, kennelId: string) => Promise<void>;
}

const IndexedDBContext = createContext<IndexedDBContextValue | null>(null);

interface IndexedDBProviderProps {
  children: ReactNode;
}

export function IndexedDBProvider({ children }: IndexedDBProviderProps) {
  const db = useMemo<AppDB>(() => new AppDB(), []);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        if (isInitialized) return;
        if (!isSupported()) {
          throw new Error("IndexedDB is not supported in this browser");
        }

        await db.open();
        setIsInitialized(true);
      } catch (error_) {
        console.error("Failed to initialize IndexedDB:", error_);
        setError(
          error_ instanceof Error
            ? error_
            : new Error("Failed to initialize IndexedDB"),
        );
      }
    };

    void initDB();

    return () => {
      // if (db) {
      // db.close();
      // }
    };
  }, [db, isInitialized]);

  const contextValue = useMemo<IndexedDBContextValue>(
    () => ({
      // Upload Methods
      addUploads: async (items) => {
        await db.uploads.bulkPut(items);
      },
      // Intake Form Methods
      assignIntakeFormToKennel: async (formId, kennelId) => {
        await db.intakeForms.update(formId, { kennelId });
      },
      clearUploads: async () => {
        await db.uploads.clear();
      },
      db,
      error,
      getAllUploads: async () => {
        return await db.uploads.toArray();
      },
      getIntakeFormByAnimalId: async (animalId) => {
        const form = await db.intakeForms
          .where("animalId")
          .equals(animalId)
          .first();
        return form ?? null;
      },
      getIntakeFormById: async (id) => {
        const form = await db.intakeForms.get(id);
        return form ?? null;
      },
      getIntakeFormByKennelId: async (kennelId) => {
        const form = await db.intakeForms
          .where("kennelId")
          .equals(kennelId)
          .first();
        return form ?? null;
      },
      getPendingUploads: async () => {
        const [pending, errors] = await Promise.all([
          db.uploads.where("status").equals("pending").toArray(),
          db.uploads.where("status").equals("error").toArray(),
        ]);
        return [...pending, ...errors.filter((item) => item.retryCount < 3)];
      },
      getUpload: async (id) => {
        return db.uploads.get(id);
      },
      getUploadByKennelId: async (kennelId) => {
        const upload = await db.uploads
          .where("kennelId")
          .equals(kennelId)
          .first();
        return upload ?? null;
      },
      removeIntakeForm: async (id: string) => {
        const form = await db.intakeForms.get(id);
        if (form) {
          // eslint-disable-next-line drizzle/enforce-delete-with-where -- Intentionally deleting a single record by ID
          await db.intakeForms.delete(id);
        }
      },
      removeUpload: async (id) => {
        // eslint-disable-next-line drizzle/enforce-delete-with-where -- Intentionally deleting a single record by ID
        await db.uploads.delete(id);
      },
      saveIntakeForm: async (form) => {
        await db.intakeForms.put(form);
      },
      updateUpload: async (id, updates) => {
        await db.uploads.update(id, updates);
      },
    }),
    [db, error],
  );

  return (
    <IndexedDBContext.Provider value={contextValue}>
      {children}
    </IndexedDBContext.Provider>
  );
}

export function useIndexedDB() {
  const context = useContext(IndexedDBContext);

  if (!context) {
    throw new Error("useIndexedDB must be used within IndexedDBProvider");
  }

  return context;
}

function isSupported(): boolean {
  return typeof globalThis !== "undefined" && !!globalThis.indexedDB;
}
