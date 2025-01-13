import { createStore } from "zustand/vanilla";

import { createId } from "@acme/id";

export interface UploadItem {
  id: string;
  file: File;
  animalId: string;
  shelterId: string;
  walkId?: string;
  status: "pending" | "uploading" | "error" | "success";
  progress: number;
  error?: string;
  retryCount: number;
  createdAt: Date;
  uploadedUrl?: string;
}

type StatusChangeListener = (item: UploadItem) => void;
export type UploadQueueSubscriber = (listener: StatusChangeListener) => void;

interface UploadQueueState {
  queue: UploadItem[];
  statusChangeListeners: StatusChangeListener[];
}

export interface UploadQueueStore extends UploadQueueState {
  addToQueue: (
    items: Omit<
      UploadItem,
      "id" | "status" | "progress" | "retryCount" | "createdAt" | "uploadedUrl"
    >[],
  ) => UploadItem[];
  removeFromQueue: (id: string) => void;
  updateItemStatus: (
    id: string,
    status: UploadItem["status"],
    error?: string,
    uploadedUrl?: string,
  ) => void;
  updateItemProgress: (id: string, progress: number) => void;
  clearQueue: () => void;
  getPendingUploads: () => UploadItem[];
  subscribe: UploadQueueSubscriber;
  setState: (
    state: UploadQueueState | ((state: UploadQueueState) => UploadQueueState),
  ) => void;
}

export const defaultInitState: UploadQueueState = {
  queue: [],
  statusChangeListeners: [],
};

export const createUploadQueueStore = (
  initState: UploadQueueState = defaultInitState,
) => {
  return createStore<UploadQueueStore>()((set, get) => ({
    ...initState,
    addToQueue: (items) => {
      const newItems = items.map((item) => ({
        ...item,
        createdAt: new Date(),
        id: createId({ prefix: "upload_" }),
        progress: 0,
        retryCount: 0,
        status: "pending" as const,
      }));
      set((state) => ({
        queue: [...state.queue, ...newItems],
      }));
      return newItems;
    },
    clearQueue: () => {
      set({ queue: [] });
    },
    getPendingUploads: () => {
      return get().queue.filter(
        (item) =>
          item.status === "pending" ||
          (item.status === "error" && item.retryCount < 3),
      );
    },
    removeFromQueue: (id) => {
      set((state) => ({
        queue: state.queue.filter((item) => item.id !== id),
      }));
    },
    setState: (stateOrFn) => {
      if (typeof stateOrFn === "function") {
        set(stateOrFn);
      } else {
        set(stateOrFn);
      }
    },
    subscribe: (listener) => {
      set((state) => ({
        statusChangeListeners: [...state.statusChangeListeners, listener],
      }));

      return () => {
        set((state) => ({
          statusChangeListeners: state.statusChangeListeners.filter(
            (l) => l !== listener,
          ),
        }));
      };
    },
    updateItemProgress: (id, progress) => {
      set((state) => ({
        queue: state.queue.map((item) =>
          item.id === id ? { ...item, progress } : item,
        ),
      }));
    },
    updateItemStatus: (id, status, error, uploadedUrl) => {
      set((state) => {
        const updatedQueue = state.queue.map((item) =>
          item.id === id
            ? {
                ...item,
                error,
                retryCount:
                  status === "error" ? item.retryCount + 1 : item.retryCount,
                status,
                uploadedUrl,
              }
            : item,
        );

        // Find the updated item to notify listeners
        const updatedItem = updatedQueue.find((item) => item.id === id);
        if (updatedItem) {
          for (const listener of state.statusChangeListeners)
            listener(updatedItem);
        }

        return {
          queue: updatedQueue,
        };
      });
    },
  }));
};
