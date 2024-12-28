import { useRef } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

import { Button } from "@acme/ui/button";

interface PhotoCaptureProps {
  photos: string[];
  onPhotosTaken: (photos: string[]) => void;
}

export function PhotoCapture({ photos, onPhotosTaken }: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Convert selected files to data URLs for preview
    for (const file of files) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotosTaken([...photos, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }

    // Reset input to allow selecting the same file again
    event.target.value = "";
  };

  return (
    <>
      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={photo}
                alt={`Photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex w-full max-w-sm flex-col gap-4">
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2"
          onClick={handlePhotoClick}
        >
          <Camera className="h-5 w-5" />
          Add Photos
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>
    </>
  );
}
