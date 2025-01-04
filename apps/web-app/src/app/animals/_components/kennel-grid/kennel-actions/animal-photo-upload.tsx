"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Trash2 } from "lucide-react";

import { createId } from "@acme/id";
import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";
import { Label } from "@acme/ui/label";
import { toast } from "@acme/ui/toast";

import { env } from "~/env.client";
import { createClient } from "~/supabase/client";

interface Photo {
  url: string;
  path: string;
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
    initialPhoto ? [{ path: "initial", url: initialPhoto }] : [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const supabase = createClient();

      // Generate a unique file path
      const fileExtension = file.name.split(".").pop() ?? "jpg";
      const filePath = `${createId()}.${fileExtension}`;

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from(env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage
        .from(env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET)
        .getPublicUrl(filePath);

      const newPhoto = { path: filePath, url: publicUrl };
      setPhotos([newPhoto]); // Only keep the latest photo
      onPhotoChange(publicUrl);
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload photo");
    } finally {
      setIsLoading(false);
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

  const removePhoto = async () => {
    const photo = photos[0];
    if (!photo || photo.path === "initial") {
      setPhotos([]);
      onPhotoChange(null);
      return;
    }

    try {
      const supabase = createClient();
      const { error: removeError } = await supabase.storage
        .from(env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET)
        .remove([photo.path]);

      if (removeError) throw removeError;

      setPhotos([]);
      onPhotoChange(null);
    } catch (error) {
      console.error("Error removing photo:", error);
      toast.error("Failed to remove photo");
    }
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
            {isLoading ? (
              <>
                <Icons.Spinner className="mr-2" size="sm" variant="muted" />
                Processing...
              </>
            ) : (
              <>
                <Camera className="mr-2 size-4" />
                {photos.length > 0 ? "Change Photo" : "Take Photo"}
              </>
            )}
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

      {photos.length > 0 && photos[0]?.url && (
        <div className="relative mx-auto">
          <div className="relative size-32">
            <Image
              src={photos[0].url}
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
