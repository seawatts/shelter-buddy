"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Trash2 } from "lucide-react";

import { createId } from "@acme/id";
import { Button } from "@acme/ui/button";
import { Label } from "@acme/ui/label";
import { toast } from "@acme/ui/toast";

import type { UploadQueueStore } from "~/stores/upload-queue";
import { UploadQueueStatus } from "~/components/upload-queue-status";
import { useIntakeFormService } from "~/providers/intake-form-provider";
import { useShelterContext } from "~/providers/shelter-provider";
import { useUploadQueue } from "~/providers/upload-queue-provider";

interface IntakeFormData {
  analyzedData: {
    approvedActivities: { activity: string; isApproved: boolean }[];
    breed: string;
    difficultyLevel: string;
    equipmentNotes: { inKennel?: string; outOfKennel?: string };
    externalId: string;
    gender: string;
    generalNotes: string;
    isFido: boolean;
    name: string;
  };
  uploadedUrl: string;
}

interface IntakeFormUploadProps {
  kennelId: string;
  onAnalysisComplete?: (data: IntakeFormData["analyzedData"]) => void;
}

export function IntakeFormUpload({
  kennelId,
  onAnalysisComplete,
}: IntakeFormUploadProps) {
  const { shelter } = useShelterContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const addToQueue = useUploadQueue(
    (state: UploadQueueStore) => state.addToQueue,
  );
  const intakeFormService = useIntakeFormService();

  // Check for existing analyzed form for this kennel
  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const existingForm =
          await intakeFormService.getFormByKennelId(kennelId);
        if (!isMounted) return;

        if (existingForm?.analyzedData) {
          setPreviewUrl(existingForm.uploadedUrl);
          onAnalysisComplete?.(existingForm.analyzedData);
        }
      } catch (error) {
        console.error("Error fetching existing form:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [kennelId, intakeFormService, onAnalysisComplete]);

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
        // await addToQueue([
        //   {
        //     animalId,
        //     file,
        //     shelterId: shelter.id,
        //   },
        // ]);

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
          <Label htmlFor="photo">Intake Form Photo</Label>
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              disabled={isAnalyzing}
            >
              <Camera className="mr-2 size-4" />
              {(() => {
                if (isAnalyzing) return "Analyzing...";
                return previewUrl ? "Change Photo" : "Upload Form";
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
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>
      <UploadQueueStatus />
    </div>
  );
}
