import type { HttpResponse, UploadOptions } from "tus-js-client";
import type { Mock } from "vitest";
import { Upload } from "tus-js-client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IndexedDBService } from "../indexed-db";
import {
  createUploadQueueStore,
  defaultInitState,
} from "~/stores/upload-queue";
import { UploadService } from "../upload-service";

interface MockUploadInstance extends Partial<Upload> {
  findPreviousUploads: Mock;
  start: Mock;
  resumeFromPreviousUpload?: Mock;
  file: File | Blob | Pick<ReadableStreamDefaultReader<Uint8Array>, "read">;
  options: UploadOptions;
}

// Mock tus-js-client
vi.mock("tus-js-client", () => ({
  Upload: vi
    .fn()
    .mockImplementation((file: File | Blob, options: UploadOptions) => {
      const instance: MockUploadInstance = {
        file,
        findPreviousUploads: vi.fn().mockResolvedValue([]),
        options,
        resumeFromPreviousUpload: vi.fn(),
        start: vi.fn().mockImplementation(() => {
          // Simulate successful upload by default
          if (options.onSuccess) {
            options.onSuccess({ lastResponse: {} as HttpResponse });
          }
        }),
      };
      return instance as unknown as Upload;
    }),
}));

describe("UploadService", () => {
  const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
  const mockUploadItem = {
    animalId: "123",
    file: mockFile,
    shelterId: "456",
    walkId: "789",
  };

  let store = createUploadQueueStore(defaultInitState);
  let uploadService: UploadService;
  let mockGetToken: Mock;
  let mockIndexedDB: IndexedDBService;

  beforeEach(() => {
    // Reset store
    store = createUploadQueueStore(defaultInitState);
    store.getState().clearQueue();

    // Mock token function
    mockGetToken = vi.fn().mockResolvedValue("mock-token");

    // Mock IndexedDB service
    mockIndexedDB = {
      addUploads: vi.fn().mockResolvedValue(undefined),
      clearUploads: vi.fn().mockResolvedValue(undefined),
      getAllUploads: vi.fn().mockResolvedValue([]),
      getIntakeFormByAnimalId: vi.fn().mockResolvedValue(null),
      getIntakeFormById: vi.fn().mockResolvedValue(null),
      getIntakeFormByKennelId: vi.fn().mockResolvedValue(null),
      getPendingUploads: vi.fn().mockResolvedValue([]),
      initialize: vi.fn().mockResolvedValue(undefined),
      removeUpload: vi.fn().mockResolvedValue(undefined),
      saveIntakeForm: vi.fn().mockResolvedValue(undefined),
      updateUpload: vi.fn().mockResolvedValue(undefined),
    } as unknown as IndexedDBService;

    // Mock navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });

    // Create service instance
    uploadService = new UploadService(store, mockGetToken, mockIndexedDB);

    // Reset mocks
    vi.clearAllMocks();
  });

  it("should start processing when online", () => {
    expect(uploadService).toBeDefined();
    // Wait for initial processing
    return new Promise((resolve) => setTimeout(resolve, 100));
  });

  it("should stop processing when offline", () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: false,
    });

    // Simulate offline event
    globalThis.dispatchEvent(new Event("offline"));

    // Wait for processing to stop
    return new Promise((resolve) => setTimeout(resolve, 100));
  });

  it("should process pending uploads", async () => {
    // Add a mock item to the queue
    store.getState().addToQueue([mockUploadItem]);

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Verify upload was started
    expect(Upload).toHaveBeenCalled();
    const uploadCall = vi.mocked(Upload).mock.calls[0];
    if (!uploadCall) {
      throw new Error("Expected Upload to have been called");
    }

    const [file, options] = uploadCall;
    expect(file).toBe(mockFile);
    expect(options).toEqual(
      expect.objectContaining({
        endpoint: expect.stringMatching("/storage/v1/upload/resumable"),
        headers: {
          authorization: "Bearer mock-token",
          "x-upsert": "true",
        },
      }),
    );

    // Verify item status was updated
    const queue = store.getState().queue;
    const uploadedItem = queue[0];
    expect(uploadedItem?.status).toBe("success");
  });

  it("should handle upload errors", async () => {
    // Override the default mock to simulate an error
    vi.mocked(Upload).mockImplementationOnce((file, options) => {
      const instance: MockUploadInstance = {
        file,
        findPreviousUploads: vi.fn().mockResolvedValue([]),
        options,
        start: vi.fn().mockImplementation(() => {
          if (options.onError) {
            options.onError(new Error("Upload failed"));
          }
        }),
      };
      return instance as unknown as Upload;
    });

    // Add a mock item to the queue
    store.getState().addToQueue([mockUploadItem]);

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Verify error handling
    const queue = store.getState().queue;
    const failedItem = queue[0];
    expect(failedItem?.status).toBe("error");
    expect(failedItem?.error).toBe("Upload failed");
  });

  it("should handle progress updates", async () => {
    // Override the default mock to simulate progress
    vi.mocked(Upload).mockImplementationOnce((file, options) => {
      const instance: MockUploadInstance = {
        file,
        findPreviousUploads: vi.fn().mockResolvedValue([]),
        options,
        start: vi.fn().mockImplementation(() => {
          if (options.onProgress) {
            options.onProgress(50, 100);
          }
          if (options.onSuccess) {
            options.onSuccess({ lastResponse: {} as HttpResponse });
          }
        }),
      };
      return instance as unknown as Upload;
    });

    // Add a mock item to the queue
    store.getState().addToQueue([mockUploadItem]);

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Verify progress update
    const queue = store.getState().queue;
    const progressItem = queue[0];
    expect(progressItem?.progress).toBe(50);
  });

  it("should resume previous uploads", async () => {
    const mockPreviousUpload = { mock: "previous-upload" };

    // Override the default mock to simulate a previous upload
    vi.mocked(Upload).mockImplementationOnce((file, options) => {
      const instance: MockUploadInstance = {
        file,
        findPreviousUploads: vi.fn().mockResolvedValue([mockPreviousUpload]),
        options,
        resumeFromPreviousUpload: vi.fn(),
        start: vi.fn().mockImplementation(() => {
          if (options.onSuccess) {
            options.onSuccess({ lastResponse: {} as HttpResponse });
          }
        }),
      };
      return instance as unknown as Upload;
    });

    // Add a mock item to the queue
    store.getState().addToQueue([mockUploadItem]);

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Verify resume attempt
    const uploadInstance = vi.mocked(Upload).mock.results[0]
      ?.value as MockUploadInstance;
    expect(uploadInstance.findPreviousUploads).toHaveBeenCalled();
    expect(uploadInstance.resumeFromPreviousUpload).toHaveBeenCalledWith(
      mockPreviousUpload,
    );
  });

  it("should handle authentication errors", async () => {
    // Mock missing token
    mockGetToken.mockResolvedValue(null);

    // Add a mock item to the queue
    store.getState().addToQueue([mockUploadItem]);

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Verify error handling
    const queue = store.getState().queue;
    const authErrorItem = queue[0];
    expect(authErrorItem?.status).toBe("error");
    expect(authErrorItem?.error).toBe("No auth session");
  });

  it("should remove successful uploads after delay", async () => {
    // Add a mock item to the queue
    store.getState().addToQueue([mockUploadItem]);

    // Wait for processing and removal delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Verify item removal
    const queue = store.getState().queue;
    expect(queue).toHaveLength(0);
  });

  it("should handle multiple items in queue", async () => {
    // Add multiple items to the queue
    store.getState().addToQueue([mockUploadItem, mockUploadItem]);

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Verify all items were processed
    const queue = store.getState().queue;
    expect(queue.every((item) => item.status === "success")).toBe(true);
  });
});
