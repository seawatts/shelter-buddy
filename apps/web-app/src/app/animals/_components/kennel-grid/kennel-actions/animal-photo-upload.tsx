"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Trash2 } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Label } from "@acme/ui/label";

interface Photo {
  url: string;
  file: File;
}

interface AnimalPhotoUploadProps {
  onPhotoChange: (photoUrl: string | null) => void;
  initialPhoto?: string | null;
}

export function AnimalPhotoUpload({
  onPhotoChange,
  initialPhoto,
}: AnimalPhotoUploadProps) {
  const [photos, setPhotos] = useState<Photo[]>(
    initialPhoto ? [{ file: new File([], "initial"), url: initialPhoto }] : [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsLoading(true);
      try {
        const newPhotos = await Promise.all(
          [...files].slice(0, 1).map(async (file) => {
            const url = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.addEventListener("load", (e) =>
                resolve(e.target?.result as string),
              );
              reader.readAsDataURL(file);
            });
            return { file, url };
          }),
        );
        setPhotos(newPhotos); // Only keep the latest photo
        onPhotoChange(newPhotos[0]?.url ?? null);
      } catch (error) {
        console.error("Error processing photo:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removePhoto = () => {
    setPhotos([]);
    onPhotoChange(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="photo">Kennel Import Form</Label>
        <div className="flex gap-2">
          <Button
            onClick={triggerFileInput}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            <Camera className="mr-2 size-4" />
            {isLoading
              ? "Processing..."
              : photos.length > 0
                ? "Change Photo"
                : "Take Photo"}
          </Button>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
            aria-label="Select photo"
          />
        </div>
      </div>

      {photos.length > 0 && (
        <div className="relative mx-auto">
          <div className="relative size-32">
            <Image
              src={photos[0]?.url ?? ""}
              alt="Animal photo"
              fill
              className="rounded-md object-cover"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute -right-2 -top-2 size-6 rounded-full p-1"
            onClick={removePhoto}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
