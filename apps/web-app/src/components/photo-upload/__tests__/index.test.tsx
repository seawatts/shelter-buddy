import "@testing-library/jest-dom/vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useServerAction } from "zsa-react";

import { toast } from "@acme/ui/toast";

import { useClient } from "~/supabase/client";
import { PhotoUpload } from "..";

vi.mock("@t3-oss/env-core", () => ({
  createEnv: vi.fn(() => ({
    NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET: "test-bucket",
    POSTGRES_URL: "postgres://test-url",
  })),
}));

vi.mock("~/env.client", () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET: "test-bucket",
    POSTGRES_URL: "test-url",
  },
}));

// Mock dependencies
vi.mock("zsa-react", () => ({
  useServerAction: vi.fn(),
}));

vi.mock("~/supabase/client", () => ({
  useClient: vi.fn(),
}));

vi.mock("@acme/ui/toast", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: function Image({
    src,
    alt,
    "data-testid": testId,
  }: {
    src: string;
    alt: string;
    "data-testid"?: string;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} data-testid={testId} />;
  },
}));

describe("PhotoUpload", () => {
  const mockProps = {
    animalId: "123",
    kennelId: "102",
    roomId: "101",
    shelterId: "456",
    walkId: "789",
  };

  const mockSupabaseUpload = vi.fn();
  const mockExecuteUpload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useClient hook
    vi.mocked(useClient).mockReturnValue({
      storage: {
        from: () => ({
          upload: mockSupabaseUpload,
        }),
      },
    } as any);

    // Mock useServerAction hook
    vi.mocked(useServerAction).mockReturnValue({
      execute: mockExecuteUpload,
      isPending: false,
    });

    // Mock successful upload
    mockSupabaseUpload.mockResolvedValue({ error: null });
    mockExecuteUpload.mockResolvedValue([{}, null]);

    // Mock URL.createObjectURL and URL.revokeObjectURL
    globalThis.URL.createObjectURL = vi.fn(() => "mock-url");
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  it("renders upload button with default label", () => {
    render(<PhotoUpload {...mockProps} />);
    expect(screen.getByTestId("photo-upload-button")).toHaveTextContent(
      "Take Photos",
    );
  });

  it("renders upload button with custom label", () => {
    render(<PhotoUpload {...mockProps} label="Custom Label" />);
    expect(screen.getByTestId("photo-upload-button")).toHaveTextContent(
      "Custom Label",
    );
  });

  it("handles file upload successfully", async () => {
    render(<PhotoUpload {...mockProps} />);

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("photo-input");

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockSupabaseUpload).toHaveBeenCalledWith(
        expect.stringContaining("123/test.jpg"),
        file,
      );
      expect(mockExecuteUpload).toHaveBeenCalledWith({
        animalId: "123",
        filePath: expect.stringContaining("123/test.jpg"),
        shelterId: "456",
        size: file.size,
        type: "image/jpeg",
        walkId: "789",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Photos uploaded successfully",
      );
    });
  });

  it("handles upload error from Supabase", async () => {
    mockSupabaseUpload.mockResolvedValue({ error: new Error("Upload failed") });
    render(<PhotoUpload {...mockProps} />);

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("photo-input");

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to upload image");
    });
  });

  it("handles server action error", async () => {
    mockExecuteUpload.mockResolvedValue([null, new Error("Server error")]);
    render(<PhotoUpload {...mockProps} />);

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("photo-input");

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create media record");
    });
  });

  it("shows loading state during upload", async () => {
    render(<PhotoUpload {...mockProps} />);

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("photo-input");

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByTestId("upload-spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId("upload-spinner")).not.toBeInTheDocument();
    });
  });

  it("displays preview images when includePreview is true", async () => {
    render(<PhotoUpload {...mockProps} includePreview />);

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("photo-input");

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByTestId("preview-image-0")).toBeInTheDocument();
    });
  });

  it("removes preview image when delete button is clicked", async () => {
    render(<PhotoUpload {...mockProps} includePreview />);

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("photo-input");

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const deleteButton = screen.getByTestId("remove-preview-0");
      fireEvent.click(deleteButton);
      expect(screen.queryByTestId("preview-image-0")).not.toBeInTheDocument();
    });
  });

  it("does not display preview images when includePreview is false", async () => {
    render(<PhotoUpload {...mockProps} includePreview={false} />);

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("photo-input");

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.queryByTestId("preview-grid")).not.toBeInTheDocument();
    });
  });
});
