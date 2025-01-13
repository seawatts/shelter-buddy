import Dexie from "dexie";

import type { DifficultyLevelEnum } from "@acme/db/schema";

import type { UploadItem } from "../stores/upload-queue";

export interface IntakeFormAnalysis {
  id: string;
  kennelId: string | null;
  animalId: string;
  uploadedUrl: string;
  analyzedData: {
    externalId: string;
    name: string;
    breed: string;
    gender: "male" | "female";
    difficultyLevel: DifficultyLevelEnum;
    isFido: boolean;
    generalNotes: string;
    approvedActivities: {
      activity: string;
      isApproved: boolean;
    }[];
    equipmentNotes: {
      inKennel?: string;
      outOfKennel?: string;
    };
  } | null;
  status: "pending" | "analyzing" | "analyzed" | "error";
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
      uploads: "id, status, createdAt",
    });
  }
}

export class IndexedDBService {
  private db: AppDB | null = null;

  async initialize(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error("IndexedDB is not supported in this browser");
    }

    try {
      this.db = new AppDB();
      await this.db.open();
    } catch (error) {
      console.error("Failed to initialize IndexedDB:", error);
      throw new Error("Failed to initialize IndexedDB");
    }
  }

  private async ensureDB(): Promise<AppDB> {
    if (!this.db) {
      await this.initialize();
    }
    if (!this.db) {
      throw new Error("Failed to initialize IndexedDB");
    }
    return this.db;
  }

  // Upload Methods
  async getAllUploads(): Promise<UploadItem[]> {
    const db = await this.ensureDB();
    return db.uploads.toArray();
  }

  async addUploads(items: UploadItem[]): Promise<void> {
    const db = await this.ensureDB();
    await db.uploads.bulkPut(items);
  }

  async updateUpload(id: string, updates: Partial<UploadItem>): Promise<void> {
    const db = await this.ensureDB();
    await db.uploads.update(id, updates);
  }

  async removeUpload(id: string): Promise<void> {
    const db = await this.ensureDB();
    // eslint-disable-next-line drizzle/enforce-delete-with-where -- Intentionally deleting a single record by ID
    await db.uploads.delete(id);
  }

  async clearUploads(): Promise<void> {
    const db = await this.ensureDB();
    await db.uploads.clear();
  }

  async getPendingUploads(): Promise<UploadItem[]> {
    const db = await this.ensureDB();
    const [pending, errors] = await Promise.all([
      db.uploads.where("status").equals("pending").toArray(),
      db.uploads.where("status").equals("error").toArray(),
    ]);

    return [...pending, ...errors.filter((item) => item.retryCount < 3)];
  }

  // Intake Form Methods
  async getIntakeFormByKennelId(
    kennelId: string,
  ): Promise<IntakeFormAnalysis | null> {
    const db = await this.ensureDB();
    const form = await db.intakeForms
      .where("kennelId")
      .equals(kennelId)
      .first();
    return form ?? null;
  }

  async getIntakeFormByAnimalId(
    animalId: string,
  ): Promise<IntakeFormAnalysis | null> {
    const db = await this.ensureDB();
    const form = await db.intakeForms
      .where("animalId")
      .equals(animalId)
      .first();
    return form ?? null;
  }

  async getIntakeFormById(id: string): Promise<IntakeFormAnalysis | null> {
    const db = await this.ensureDB();
    const form = await db.intakeForms.get(id);
    return form ?? null;
  }

  async saveIntakeForm(form: IntakeFormAnalysis): Promise<void> {
    const db = await this.ensureDB();
    await db.intakeForms.put(form);
  }

  async assignIntakeFormToKennel(
    formId: string,
    kennelId: string,
  ): Promise<void> {
    const db = await this.ensureDB();
    await db.intakeForms.update(formId, { kennelId });
  }

  isSupported(): boolean {
    return typeof globalThis !== "undefined" && !!globalThis.indexedDB;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
