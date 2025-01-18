"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Upload } from "tus-js-client";

import { createId } from "@acme/id";
import { toast } from "@acme/ui/toast";

import type { UploadItem } from "~/types/upload";
import { env } from "~/env.client";
import { uploadPhotoAction } from "./actions/upload-queue-actions";
import { useIndexedDB } from "./indexed-db-provider";

interface UploadQueueContextValue {
  addToQueue: (
    items: Omit<
      UploadItem,
      "id" | "status" | "progress" | "retryCount" | "createdAt" | "uploadedUrl"
    >[],
  ) => Promise<UploadItem[]>;
}

const UploadQueueContext = createContext<UploadQueueContextValue | null>(null);

export interface UploadQueueProviderProps {
  children: ReactNode;
}

export function UploadQueueProvider({ children }: UploadQueueProviderProps) {
  const db = useIndexedDB();
  const { getToken } = useAuth();

  const processUpload = useCallback(
    async (item: UploadItem) => {
      if (!navigator.onLine) return;

      try {
        await db.updateUpload(item.id, { status: "uploading" });

        const token = await getToken({ template: "supabase" });
        if (!token) throw new Error("No auth session");
        if (!item.file.name) throw new Error("File name is required");

        const fileExtension = item.file.name.split(".").pop() ?? "png";
        const fileBaseName = item.file.name.split(".")[0] ?? "unknown";
        const id = createId({ prefix: "upload_" });
        const filePath = `${item.animalId}/${id}_${fileBaseName}.${fileExtension}`;

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
              void db.updateUpload(item.id, { progress: percentage });
            },
            onSuccess: () => {
              resolve();
            },
            removeFingerprintOnSuccess: true,
            retryDelays: [0, 3000, 5000, 10_000, 20_000],
            uploadDataDuringCreation: true,
          });

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

        const uploadedUrl = new URL(
          `/storage/v1/object/public/${env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET}/${filePath}`,
          env.NEXT_PUBLIC_SUPABASE_URL,
        ).toString();

        await db.updateUpload(item.id, {
          status: "success",
          uploadedUrl,
        });
        await uploadPhotoAction({
          animalId: item.animalId,
          filePath: filePath,
          height: item.height,
          shelterId: item.shelterId,
          size: item.file.size,
          type: item.file.type || "image/png",
          walkId: item.walkId,
          width: item.width,
        });

        if (!item.isIntakeForm) {
          await db.removeUpload(item.id);
        }

        toast.success("Photos uploaded");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Upload failed");
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        await db.updateUpload(item.id, {
          error: errorMessage,
          retryCount: item.retryCount + 1,
          status: "error",
        });
      }
    },
    [db, getToken],
  );

  const addToQueue = useCallback(
    async (
      items: Omit<
        UploadItem,
        | "id"
        | "status"
        | "progress"
        | "retryCount"
        | "createdAt"
        | "uploadedUrl"
      >[],
    ) => {
      const newItems = items.map((item) => ({
        ...item,
        createdAt: new Date(),
        id: createId({ prefix: "upload_" }),
        progress: 0,
        retryCount: 0,
        status: "pending" as const,
      }));

      await db.addUploads(newItems);

      // Start uploading each item
      for (const item of newItems) {
        void processUpload(item);
      }

      return newItems;
    },
    [db, processUpload],
  );

  return (
    <UploadQueueContext.Provider
      value={{
        addToQueue,
      }}
    >
      {children}
    </UploadQueueContext.Provider>
  );
}

export function useUploadQueue() {
  const context = useContext(UploadQueueContext);
  if (!context) {
    throw new Error("useUploadQueue must be used within UploadQueueProvider");
  }
  return context;
}
