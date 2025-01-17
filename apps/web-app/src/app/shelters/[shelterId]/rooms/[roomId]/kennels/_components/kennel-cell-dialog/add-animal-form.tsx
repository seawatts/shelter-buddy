"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Camera, Info, PenLine } from "lucide-react";

import { createId } from "@acme/id";
import { Alert, AlertDescription, AlertTitle } from "@acme/ui/alert";
import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";

import { useDrawer } from "~/providers/drawer-provider";
import { useIndexedDB } from "~/providers/indexed-db-provider";
import { useIntakeForm } from "~/providers/intake-form-provider";
import { useShelterContext } from "~/providers/shelter-provider";
import { useUploadQueue } from "~/providers/upload-queue-provider";
import { ImageProcessor } from "~/utils/image-processor";

interface Props {
  kennelId: string;
  roomId: string;
  onOpenChange: (open: boolean) => void;
}

export function AddAnimalForm({ kennelId, roomId, onOpenChange }: Props) {
  const { shelter } = useShelterContext();
  const { setActiveSnapPoint, setSnapPoints } = useDrawer();
  const { addToQueue } = useUploadQueue();
  const intakeForm = useIntakeForm();
  const db = useIndexedDB();

  const upload = useLiveQuery(
    async () => {
      return db.getUploadByKennelId(kennelId);
    },
    [kennelId],
    null,
  );

  const form = useLiveQuery(
    async () => {
      return db.getIntakeFormByKennelId(kennelId);
    },
    [kennelId],
    null,
  );

  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when upload status changes
  useEffect(() => {
    if (upload) {
      if (upload.status === "error") {
        setError(upload.error ?? "Upload failed");
        setIsAnalyzing(false);
      }
      if (upload.status === "success" && upload.uploadedUrl) {
        setIsAnalyzing(true);
      }
    }
  }, [upload]);

  // Update local state when form status changes
  useEffect(() => {
    if (form) {
      switch (form.status) {
        case "error": {
          setIsAnalyzing(false);
          setError(form.error ?? "Failed to analyze form");
          break;
        }
        case "analyzed": {
          setIsAnalyzing(false);
          onOpenChange(false);
          break;
        }
        case "analyzing": {
          setIsAnalyzing(true);
          break;
        }
        // No default
      }
    }
  }, [form, onOpenChange, setActiveSnapPoint, setSnapPoints]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Reset state
      setError(null);
      setIsAnalyzing(false);

      // Clear existing upload and form data
      const existingUpload = await db.getUploadByKennelId(kennelId);
      if (existingUpload) {
        await db.removeUpload(existingUpload.id);
      }
      const existingForm = await intakeForm.getFormByKennelId(kennelId);
      if (existingForm) {
        await db.removeIntakeForm(existingForm.id);
      }

      try {
        // Convert file to base64
        const processedImage = await ImageProcessor.processImage(file);
        setSnapPoints([1]);
        setActiveSnapPoint(1); // Set to larger snap point when preview is added

        const animalId = createId({ prefix: "animal" });
        await addToQueue([
          {
            animalId,
            file: processedImage.file,
            height: processedImage.dimensions.height,
            isIntakeForm: true,
            kennelId,
            previewUrl: processedImage.previewBase64,
            roomId,
            shelterId: shelter.id,
            width: processedImage.dimensions.width,
          },
        ]);
      } catch (error) {
        console.error("Error processing form:", error);
        setError("Error processing form. Please try again.");
        setIsAnalyzing(false);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [
      addToQueue,
      kennelId,
      roomId,
      setActiveSnapPoint,
      setSnapPoints,
      shelter.id,
      intakeForm,
      db,
    ],
  );

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex flex-col gap-4">
        <div className="grid gap-4">
          <Alert>
            <Info className="size-4" />
            <AlertTitle>Instructions</AlertTitle>
            <AlertDescription className="mt-3">
              <ul className="list-disc space-y-1.5">
                <li>Take a photo of the kennel intake form</li>
                <li>AI will process the form (takes ~15 seconds)</li>
                <li>
                  You can close this dialog - processing continues in background
                </li>
              </ul>
            </AlertDescription>
          </Alert>
          {(() => {
            if (form?.status === "analyzed") {
              return (
                <Button variant="default" className="w-full" asChild>
                  <Link
                    href={`/shelters/${shelter.id}/rooms/${roomId}/kennels/${kennelId}/intake`}
                  >
                    <PenLine className="mr-2 size-4" />
                    Complete Animal Details
                  </Link>
                </Button>
              );
            }

            if (form?.status === "editing") {
              return (
                <div className="flex flex-col gap-4">
                  <Button variant="default" className="w-full" asChild>
                    <Link
                      href={`/shelters/${shelter.id}/rooms/${roomId}/kennels/${kennelId}/intake`}
                    >
                      <PenLine className="mr-2 size-4" />
                      Continue Editing
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={async () => {
                      setError(null);
                      const existingUpload =
                        await db.getUploadByKennelId(kennelId);
                      if (existingUpload) {
                        await db.removeUpload(existingUpload.id);
                      }
                      const existingForm =
                        await intakeForm.getFormByKennelId(kennelId);
                      if (existingForm) {
                        await db.removeIntakeForm(existingForm.id);
                      }
                      setSnapPoints(["445px"]);
                      setActiveSnapPoint("445px");
                    }}
                  >
                    <Icons.X className="mr-2 size-4" />
                    Cancel Editing
                  </Button>
                </div>
              );
            }

            return (
              <div className="flex flex-col gap-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="default"
                  className="w-full"
                  disabled={
                    (isAnalyzing || upload?.status === "uploading") &&
                    form?.status !== "error"
                  }
                >
                  {upload?.status === "uploading" ||
                  form?.status === "analyzing" ? (
                    <Icons.Spinner size="sm" className="mr-2" />
                  ) : (
                    <Camera className="mr-2 size-4" />
                  )}
                  {(() => {
                    if (upload?.status === "uploading") return "Uploading...";
                    if (form?.status === "analyzing") return "Analyzing...";
                    if (form?.status === "error") return "Change Photo";
                    if (upload?.previewUrl) return "Change Photo";
                    return "Upload Intake Form";
                  })()}
                </Button>
                {(form?.status === "error" || upload?.status === "error") && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={async () => {
                      setError(null);
                      const existingUpload =
                        await db.getUploadByKennelId(kennelId);
                      if (existingUpload) {
                        await db.removeUpload(existingUpload.id);
                      }
                      const existingForm =
                        await intakeForm.getFormByKennelId(kennelId);
                      if (existingForm) {
                        await db.removeIntakeForm(existingForm.id);
                      }
                      setSnapPoints(["445px"]);
                      setActiveSnapPoint("445px");
                    }}
                  >
                    <Icons.X className="mr-2 size-4" />
                    Cancel
                  </Button>
                )}
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
          })()}
        </div>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          aria-label="Select photo"
        />

        {error ? (
          <Alert variant="destructive">
            <Icons.AlertTriangle size="sm" />
            <AlertTitle>Upload Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {upload?.previewUrl && (
          <div className="relative mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={upload.previewUrl}
              alt="Intake form"
              className="rounded-md object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}
