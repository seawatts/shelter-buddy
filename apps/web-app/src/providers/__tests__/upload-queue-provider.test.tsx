"use client";

import type { Upload, UploadOptions } from "tus-js-client";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { IndexedDBContextValue } from "../indexed-db-provider";
import { IndexedDBProvider } from "../indexed-db-provider";
import { UploadQueueProvider, useUploadQueue } from "../upload-queue-provider";

describe("UploadQueueProvider", () => {
  const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
  let mockUploadInstance: Partial<Upload>;
  let mockOptions: UploadOptions;

  beforeEach(() => {
    mockOptions = {
      endpoint: "",
      onSuccess: vi.fn(),
    };

    mockUploadInstance = {
      abort: vi.fn(),
      findPreviousUploads: vi.fn().mockResolvedValue([]),
      resumeFromPreviousUpload: vi.fn(),
      start: vi.fn(),
    };

    vi.mock("tus-js-client", () => ({
      Upload: vi
        .fn()
        .mockImplementation((_file: File, options: UploadOptions) => {
          mockOptions = options;
          return mockUploadInstance as Upload;
        }),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should handle file upload successfully", async () => {
    const mockIndexedDB: IndexedDBContextValue = {
      addUploads: vi.fn(),
      assignIntakeFormToKennel: vi.fn(),
      clearUploads: vi.fn(),
      db: null,
      error: null,
      getAllUploads: vi.fn(),
      getIntakeFormByAnimalId: vi.fn(),
      getIntakeFormById: vi.fn(),
      getIntakeFormByKennelId: vi.fn(),
      getPendingUploads: vi.fn(),
      getUpload: vi.fn(),
      getUploadByKennelId: vi.fn(),
      isInitialized: true,
      removeIntakeForm: vi.fn(),
      removeUpload: vi.fn(),
      saveIntakeForm: vi.fn(),
      updateUpload: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <IndexedDBProvider>
        <UploadQueueProvider>{children}</UploadQueueProvider>
      </IndexedDBProvider>
    );

    const { result } = renderHook(() => useUploadQueue(), { wrapper });

    const uploadItems = [
      {
        animalId: "test-animal",
        file: mockFile,
        height: 100,
        isIntakeForm: false,
        kennelId: "test-kennel",
        previewUrl: "test-preview",
        shelterId: "test-shelter",
        width: 100,
      },
    ];

    await result.current.addToQueue(uploadItems);

    expect(mockIndexedDB.addUploads).toHaveBeenCalled();

    // Mock successful upload
    mockOptions.onSuccess?.({
      lastResponse: {
        getBody: () => "",
        getHeader: () => "",
        getStatus: () => 200,
        getUnderlyingObject: () => ({}),
      },
    });

    expect(mockIndexedDB.updateUpload).toHaveBeenCalled();
  });
});
