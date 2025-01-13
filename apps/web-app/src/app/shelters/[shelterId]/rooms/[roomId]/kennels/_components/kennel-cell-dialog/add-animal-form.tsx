"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, PenLine, Trash2 } from "lucide-react";

import { createId } from "@acme/id";
import { Button } from "@acme/ui/button";
import { Separator } from "@acme/ui/separator";
import { toast } from "@acme/ui/toast";

import type { UploadQueueStore } from "~/stores/upload-queue";
import { UploadQueueStatus } from "~/components/upload-queue-status";
import { useIntakeFormService } from "~/providers/intake-form-provider";
import { useShelterContext } from "~/providers/shelter-provider";
import { useUploadQueue } from "~/providers/upload-queue-provider";

export function AddAnimalForm({
  kennelId,
  roomId,
  onSubmit,
}: {
  kennelId: string;
  roomId: string;
  onSubmit: () => void;
}) {
  const { shelter } = useShelterContext();

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const addToQueue = useUploadQueue(
    (state: UploadQueueStore) => state.addToQueue,
  );
  const removeFromQueue = useUploadQueue(
    (state: UploadQueueStore) => state.removeFromQueue,
  );
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);

  const intakeFormService = useIntakeFormService();

  // Check for existing analyzed form for this kennel
  useEffect(() => {
    void (async () => {
      const existingForm = await intakeFormService.getFormByKennelId(kennelId);
      if (existingForm?.analyzedData) {
        setPreviewUrl(existingForm.uploadedUrl);
      }
    })();
  }, [kennelId, intakeFormService]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        // Create a local preview URL for display only
        const localPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(localPreviewUrl);

        const animalId = createId({ prefix: "animal" });

        // Add to upload queue
        const newUploads = addToQueue([
          {
            animalId,
            file,
            shelterId: shelter.id,
          },
        ]);
        setCurrentUploadId(newUploads[0]?.id ?? null);

        // The IntakeFormService will handle the analysis once the upload is complete
        setIsAnalyzing(true);
      } catch (error) {
        console.error("Error processing form:", error);
        toast.error("Error processing form");
        setIsAnalyzing(false);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [addToQueue, shelter],
  );

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="default"
            className="w-full"
            disabled={isAnalyzing}
          >
            <Camera className="mr-2 size-4" />
            {(() => {
              if (isAnalyzing) return "Analyzing...";
              return previewUrl ? "Change Photo" : "Upload Intake Form";
            })()}
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

        {previewUrl && (
          <div className="relative mx-auto">
            <div className="relative size-64">
              <Image
                src={previewUrl}
                alt="Intake form"
                fill
                className="rounded-md object-contain"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute -right-2 -top-2 size-6 rounded-full p-1"
              onClick={() => {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
                if (currentUploadId) {
                  removeFromQueue(currentUploadId);
                }
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>
      <UploadQueueStatus />
      <Separator />
      <Button variant="outline" className="w-full" asChild>
        <Link
          href={`/shelters/${shelter.id}/rooms/${roomId}/kennels/${kennelId}/intake`}
        >
          <PenLine className="mr-2 size-4" />
          Manually Enter
        </Link>
      </Button>
    </div>
  );
}
