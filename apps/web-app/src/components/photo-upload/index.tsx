"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Trash2 } from "lucide-react";

import type { ButtonProps } from "@acme/ui/button";
import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";
import { cn } from "@acme/ui/lib/utils";

import type { UploadItem } from "~/types/upload";
import { useUploadQueue } from "~/providers/upload-queue-provider";
import { ImageProcessor } from "~/utils/image-processor";

interface PhotoUploadProps {
  animalId: string;
  label?: string;
  walkId?: string;
  shelterId: string;
  includePreview?: boolean;
  roomId: string;
  kennelId: string;
  isIntakeForm?: boolean;
  className?: string;
  variant?: ButtonProps["variant"];
}

export function PhotoUpload({
  animalId,
  walkId,
  shelterId,
  includePreview = true,
  roomId,
  kennelId,
  isIntakeForm = false,
  className,
  label,
  variant,
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { addToQueue } = useUploadQueue();

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files?.length) return;

      setIsUploading(true);
      const newPreviewUrls: string[] = [];
      const uploadItems: Omit<
        UploadItem,
        | "id"
        | "status"
        | "progress"
        | "retryCount"
        | "createdAt"
        | "uploadedUrl"
      >[] = [];

      try {
        for (const file of files) {
          // Process the image before uploading
          const processedImage = await ImageProcessor.processImage(file);

          // Use the processed image's preview URL
          newPreviewUrls.push(processedImage.preview);

          // Add to upload queue
          uploadItems.push({
            animalId,
            file: processedImage.file,
            height: processedImage.dimensions.height,
            isIntakeForm,
            kennelId,
            previewUrl: processedImage.preview,
            roomId: roomId,
            shelterId: shelterId,
            walkId: walkId,
            width: processedImage.dimensions.width,
          });
        }

        // Add all items to the upload queue
        await addToQueue(uploadItems);

        setPreviewUrls((previous) => [...previous, ...newPreviewUrls]);
      } catch (error) {
        console.error("Error processing photos:", error);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [animalId, isIntakeForm, kennelId, roomId, shelterId, walkId, addToQueue],
  );

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      for (const url of previewUrls) {
        if (url) {
          URL.revokeObjectURL(url);
        }
      }
    };
  }, [previewUrls]);

  const removePreview = (index: number) => {
    const url = previewUrls[index];
    if (url) {
      URL.revokeObjectURL(url);
    }
    setPreviewUrls((previous) =>
      previous.filter((_, index_) => index_ !== index),
    );
  };

  return (
    <div className="flex w-full flex-col gap-4" data-testid="photo-upload">
      <div className="flex w-full gap-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant={variant ?? "outline"}
          className={cn("w-full", className)}
          disabled={isUploading}
          data-testid="photo-upload-button"
        >
          {isUploading ? (
            <>
              <Icons.Spinner
                className="mr-2"
                size="sm"
                variant="muted"
                data-testid="upload-spinner"
              />
              Processing...
            </>
          ) : (
            <>
              <Camera className="mr-2 size-4" data-testid="camera-icon" />
              {label ?? "Take Photos"}
            </>
          )}
        </Button>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          data-testid="photo-input"
          aria-label="Select photos"
        />
      </div>

      {includePreview && previewUrls.length > 0 && (
        <div
          className="grid grid-cols-2 gap-4 sm:grid-cols-3"
          data-testid="preview-grid"
        >
          {previewUrls.map((url, index) => (
            <div
              key={index}
              className="relative"
              data-testid={`preview-item-${index}`}
            >
              <div className="relative aspect-square w-full rounded bg-muted">
                <Image
                  src={url}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="rounded-md object-cover"
                  data-testid={`preview-image-${index}`}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="absolute -right-2 -top-2 size-6 rounded-full p-1"
                onClick={() => removePreview(index)}
                data-testid={`remove-preview-${index}`}
              >
                <Trash2
                  className="size-4"
                  data-testid={`trash-icon-${index}`}
                />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
