"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Trash2 } from "lucide-react";
import { useServerAction } from "zsa-react";

import type { ButtonProps } from "@acme/ui/button";
import { createId } from "@acme/id";
import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";
import { cn } from "@acme/ui/lib/utils";
import { toast } from "@acme/ui/toast";

import { env } from "~/env.client";
import { createClient } from "~/supabase/client";
import { uploadPhotoAction } from "./actions";

interface PhotoUploadProps {
  animalId: string;
  label?: string;
  walkId?: string;
  shelterId: string;
  includePreview?: boolean;
  className?: string;
  variant?: ButtonProps["variant"];
}

export function PhotoUpload({
  animalId,
  walkId,
  shelterId,
  includePreview = true,
  className,
  label,
  variant,
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { execute: executeUpload, isPending } =
    useServerAction(uploadPhotoAction);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    const newPreviewUrls: string[] = [];

    try {
      const supabase = createClient();

      for (const file of files) {
        // Create a local preview URL
        const localPreviewUrl = URL.createObjectURL(file);
        newPreviewUrls.push(localPreviewUrl);

        // Generate a unique file path
        const fileExtension = file.name.split(".").pop() ?? "png";
        const fileName = createId({ prefix: "photo" });
        const filePath = walkId
          ? `${walkId}/${fileName}.${fileExtension}`
          : `${animalId}/${fileName}.${fileExtension}`;

        // Upload the file to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from(env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET)
          .upload(filePath, file);

        if (uploadError) {
          console.error("Failed to upload image", uploadError);
          toast.error("Failed to upload image");
          throw uploadError;
        }

        // Create media record in the database
        const [result, error] = await executeUpload({
          animalId,
          filePath,
          shelterId,
          type: `image/${fileExtension}`,
          walkId,
        });

        if (error) {
          console.error("Failed to create media record", error);
          toast.error("Failed to create media record");
          throw new Error("Failed to create media record");
        }
      }

      setPreviewUrls((previous) => [...previous, ...newPreviewUrls]);
      toast.success("Photos uploaded successfully");
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast.error("Error uploading photos");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full gap-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant={variant ?? "outline"}
          className={cn("w-full", className)}
          disabled={isUploading || isPending}
        >
          {isUploading ? (
            <>
              <Icons.Spinner className="mr-2" size="sm" variant="muted" />
              Uploading...
            </>
          ) : (
            <>
              <Camera className="mr-2 size-4" />
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
          aria-label="Select photos"
        />
      </div>

      {includePreview && previewUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative">
              <div className="relative aspect-square w-full">
                <Image
                  src={url}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="rounded-md object-cover"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="absolute -right-2 -top-2 size-6 rounded-full p-1"
                onClick={() => removePreview(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
