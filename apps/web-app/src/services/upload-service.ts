import { Upload } from "tus-js-client";

import type { IndexedDBService } from "./indexed-db";
import type { UploadQueueStoreApi } from "~/providers/upload-queue-provider";
import { env } from "~/env.client";

export class UploadService {
  private isProcessing = false;
  private unsubscribe?: () => void;
  private store: UploadQueueStoreApi;
  private getToken: () => Promise<string | null>;
  private db: IndexedDBService;

  constructor(
    store: UploadQueueStoreApi,
    getToken: () => Promise<string | null>,
    db: IndexedDBService,
  ) {
    this.store = store;
    this.getToken = getToken;
    this.db = db;

    // Start processing when online
    if (typeof globalThis !== "undefined") {
      globalThis.addEventListener("online", () => {
        this.startProcessing();
      });

      globalThis.addEventListener("offline", () => {
        this.stopProcessing();
      });

      // Initial check
      if (navigator.onLine) {
        this.startProcessing();
      }
    }
  }

  private async initializeDB(): Promise<void> {
    try {
      await this.db.initialize();
      // Load initial items from IndexedDB
      const items = await this.db.getAllUploads();
      if (items.length > 0) {
        // Update store with items from IndexedDB
        this.store.setState((state) => ({
          ...state,
          queue: items,
        }));
      }
    } catch (error) {
      console.error("Failed to initialize IndexedDB:", error);
    }
  }

  private async processItem(
    item: ReturnType<UploadQueueStoreApi["getState"]>["queue"][number],
  ) {
    if (!navigator.onLine) {
      this.stopProcessing();
      return;
    }

    try {
      // Update both store and IndexedDB
      this.store.getState().updateItemStatus(item.id, "uploading");
      await this.db.updateUpload(item.id, { status: "uploading" });

      // Get Clerk session token
      const token = await this.getToken();
      if (!token) throw new Error("No auth session");
      if (!item.file.name) throw new Error("File name is required");

      // Generate a unique file path
      const fileExtension = item.file.name.split(".").pop() ?? "png";
      const fileBaseName = item.file.name.split(".")[0] ?? "unknown";
      const filePath = `${item.animalId}/${fileBaseName}.${fileExtension}`;

      await new Promise<void>((resolve, reject) => {
        const upload = new Upload(item.file, {
          chunkSize: 6 * 1024 * 1024,
          endpoint: `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
          headers: {
            authorization: `Bearer ${token}`,
            "x-upsert": "true",
          },
          metadata: {
            bucketName: env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET,
            cacheControl: "3600",
            contentType: item.file.type || "application/octet-stream",
            objectName: filePath,
          },
          onError: (error) => {
            console.error("Upload error:", error);
            reject(error);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const percentage = (bytesUploaded / bytesTotal) * 100;
            // Update both store and IndexedDB
            this.store.getState().updateItemProgress(item.id, percentage);
            // Fire and forget IndexedDB update
            this.db
              .updateUpload(item.id, { progress: percentage })
              .catch(console.error);
          },
          onSuccess: () => {
            resolve();
          },
          removeFingerprintOnSuccess: true,
          retryDelays: [0, 3000, 5000, 10_000, 20_000],
          uploadDataDuringCreation: true,
        });

        // Check for previous uploads to resume
        void upload
          .findPreviousUploads()
          .then((previousUploads) => {
            if (previousUploads.length > 0 && previousUploads[0]) {
              upload.resumeFromPreviousUpload(previousUploads[0]);
            }
            upload.start();
          })
          .catch((error) => {
            console.error("Failed to find previous uploads:", error);
            upload.start();
          });
      });

      // Update status with the uploaded URL
      const uploadedUrl = new URL(
        `/storage/v1/object/public/${env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET}/${filePath}`,
        env.NEXT_PUBLIC_SUPABASE_URL,
      ).toString();

      // Update both store and IndexedDB
      this.store
        .getState()
        .updateItemStatus(item.id, "success", undefined, uploadedUrl);
      await this.db.updateUpload(item.id, {
        status: "success",
        uploadedUrl,
      });

      // Remove successful upload from queue after a delay
      // setTimeout(async () => {
      // this.store.getState().removeFromQueue(item.id);
      // await this.db.removeUpload(item.id);
      // }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";

      // Update both store and IndexedDB
      this.store.getState().updateItemStatus(item.id, "error", errorMessage);
      await this.db.updateUpload(item.id, {
        error: errorMessage,
        retryCount: item.retryCount + 1,
        status: "error",
      });
    }
  }

  public startProcessing() {
    if (this.unsubscribe) return;

    // Subscribe to queue changes
    this.unsubscribe = this.store.subscribe((state) => {
      const pendingUploads = state.queue.filter(
        (item) =>
          item.status === "pending" ||
          (item.status === "error" && item.retryCount < 3),
      );

      if (pendingUploads.length > 0 && !this.isProcessing) {
        this.isProcessing = true;
        void Promise.all(
          pendingUploads.map((item) => this.processItem(item)),
        ).finally(() => {
          this.isProcessing = false;
        });
      }
    });
  }

  public stopProcessing() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
    this.isProcessing = false;
  }

  public cleanup(): void {
    this.stopProcessing();
  }
}

// The service instance will be created by the provider when it initializes
