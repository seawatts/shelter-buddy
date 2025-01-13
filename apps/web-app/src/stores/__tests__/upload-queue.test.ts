import { beforeEach, describe, expect, it } from "vitest";

import { createUploadQueueStore, defaultInitState } from "../upload-queue";

describe("Upload Queue Store", () => {
  const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
  const mockUploadItem = {
    animalId: "123",
    file: mockFile,
    shelterId: "456",
    walkId: "789",
  };

  let store: ReturnType<typeof createUploadQueueStore>;

  beforeEach(() => {
    // Create a fresh store with default state for each test
    store = createUploadQueueStore(defaultInitState);
    // Clear any persisted state
    store.getState().clearQueue();
  });

  it("should initialize with an empty queue", () => {
    expect(store.getState().queue).toEqual([]);
  });

  it("should add items to the queue", () => {
    store.getState().addToQueue([mockUploadItem]);
    const queue = store.getState().queue;

    expect(queue).toHaveLength(1);
    const [firstItem] = queue;
    if (!firstItem) {
      throw new Error("Item is undefined");
    }
    expect(firstItem).toMatchObject({
      ...mockUploadItem,
      progress: 0,
      retryCount: 0,
      status: "pending",
    });
    expect(firstItem.id).toBeDefined();
    expect(firstItem.createdAt).toBeInstanceOf(Date);
  });

  it("should remove items from the queue", () => {
    store.getState().addToQueue([mockUploadItem]);
    const queue = store.getState().queue;
    expect(queue).toHaveLength(1);
    const [firstItem] = queue;
    if (!firstItem) {
      throw new Error("Item is undefined");
    }
    const itemId = firstItem.id;

    store.getState().removeFromQueue(itemId);
    expect(store.getState().queue).toHaveLength(0);
  });

  it("should update item status", () => {
    store.getState().addToQueue([mockUploadItem]);
    const queue = store.getState().queue;
    expect(queue).toHaveLength(1);
    const [firstItem] = queue;
    if (!firstItem) {
      throw new Error("Item is undefined");
    }
    const itemId = firstItem.id;

    store.getState().updateItemStatus(itemId, "uploading");
    const updatedQueue = store.getState().queue;
    expect(updatedQueue).toHaveLength(1);
    const [updatedItem] = updatedQueue;
    if (!updatedItem) {
      throw new Error("Item is undefined");
    }
    expect(updatedItem.status).toBe("uploading");
  });

  it("should increment retry count on error status", () => {
    store.getState().addToQueue([mockUploadItem]);
    const queue = store.getState().queue;
    expect(queue).toHaveLength(1);
    const [firstItem] = queue;
    if (!firstItem) {
      throw new Error("Item is undefined");
    }
    const itemId = firstItem.id;

    store.getState().updateItemStatus(itemId, "error", "Upload failed");
    const updatedQueue = store.getState().queue;
    expect(updatedQueue).toHaveLength(1);
    const [updatedItem] = updatedQueue;
    if (!updatedItem) {
      throw new Error("Item is undefined");
    }
    expect(updatedItem.retryCount).toBe(1);
    expect(updatedItem.error).toBe("Upload failed");
  });

  it("should update item progress", () => {
    store.getState().addToQueue([mockUploadItem]);
    const queue = store.getState().queue;
    expect(queue).toHaveLength(1);
    const [firstItem] = queue;
    if (!firstItem) {
      throw new Error("Item is undefined");
    }
    const itemId = firstItem.id;

    store.getState().updateItemProgress(itemId, 50);
    const updatedQueue = store.getState().queue;
    expect(updatedQueue).toHaveLength(1);
    const [updatedItem] = updatedQueue;
    if (!updatedItem) {
      throw new Error("Item is undefined");
    }
    expect(updatedItem.progress).toBe(50);
  });

  it("should clear the queue", () => {
    store.getState().addToQueue([mockUploadItem, mockUploadItem]);
    expect(store.getState().queue).toHaveLength(2);

    store.getState().clearQueue();
    expect(store.getState().queue).toHaveLength(0);
  });

  it("should get pending uploads", () => {
    const items = [mockUploadItem, mockUploadItem, mockUploadItem];

    store.getState().addToQueue(items);
    const queue = store.getState().queue;
    expect(queue).toHaveLength(3);
    const [firstItem, secondItem, thirdItem] = queue;
    if (!firstItem || !secondItem || !thirdItem) {
      throw new Error("Items are undefined");
    }

    // Set different statuses
    store.getState().updateItemStatus(firstItem.id, "success");
    store.getState().updateItemStatus(secondItem.id, "error");

    const pendingUploads = store.getState().getPendingUploads();
    expect(pendingUploads).toHaveLength(2); // One pending and one error (retryable)
    expect(pendingUploads.some((item) => item.status === "pending")).toBe(true);
    expect(pendingUploads.some((item) => item.status === "error")).toBe(true);
  });

  it("should not include failed items with retry count >= 3 in pending uploads", () => {
    store.getState().addToQueue([mockUploadItem]);
    const queue = store.getState().queue;
    expect(queue).toHaveLength(1);
    const [firstItem] = queue;
    if (!firstItem) {
      throw new Error("Item is undefined");
    }
    const itemId = firstItem.id;

    // Simulate 3 failures
    store.getState().updateItemStatus(itemId, "error");
    store.getState().updateItemStatus(itemId, "error");
    store.getState().updateItemStatus(itemId, "error");

    const pendingUploads = store.getState().getPendingUploads();
    expect(pendingUploads).toHaveLength(0);
  });
});
