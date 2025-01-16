"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import type { DifficultyLevelEnum } from "@acme/db/schema";
import { toast } from "@acme/ui/toast";

import type { IntakeFormAnalysis } from "./indexed-db-provider";
import { analyzeIntakeFormAction } from "./actions/intake-form-actions";
import { useIndexedDB } from "./indexed-db-provider";

interface IntakeFormContextValue {
  assignToKennel: (formId: string, kennelId: string) => Promise<void>;
  getFormByAnimalId: (animalId: string) => Promise<IntakeFormAnalysis | null>;
  getFormByKennelId: (kennelId: string) => Promise<IntakeFormAnalysis | null>;
}

const IntakeFormContext = createContext<IntakeFormContextValue | null>(null);

export interface IntakeFormProviderProps {
  children: ReactNode;
}

export function IntakeFormProvider({ children }: IntakeFormProviderProps) {
  const db = useIndexedDB();

  // Watch for successful uploads to process them
  const uploads = useLiveQuery(
    async () => {
      if (!db.isInitialized) return [];
      return db.getAllUploads();
    },
    [db],
    [],
  );

  useEffect(() => {
    async function processSuccessfulUploads() {
      for (const upload of uploads) {
        // Only process intake form uploads that have succeeded but haven't been analyzed yet
        if (
          !upload.isIntakeForm ||
          upload.status !== "success" ||
          !upload.uploadedUrl ||
          !upload.roomId ||
          !upload.shelterId
        ) {
          continue;
        }

        // Check if we already have a form being analyzed for this kennel
        const existingForm = await db.getIntakeFormByKennelId(upload.kennelId);
        if (
          existingForm?.status === "analyzing" ||
          existingForm?.status === "error"
        ) {
          continue;
        }

        // Create a new form analysis entry
        const form: IntakeFormAnalysis = {
          analyzedData: null,
          animalId: upload.animalId,
          createdAt: new Date(),
          error: undefined,
          id: upload.id,
          kennelId: upload.kennelId,
          previewUrl: upload.previewUrl,
          roomId: upload.roomId,
          shelterId: upload.shelterId,
          status: "analyzing",
          uploadedUrl: upload.uploadedUrl,
        };

        await db.saveIntakeForm(form);

        // Start the analysis process
        try {
          const [result, error] = await analyzeIntakeFormAction({
            imageUrl: form.uploadedUrl,
            roomId: upload.roomId,
            shelterId: upload.shelterId,
          });

          if (error || !result.success) {
            throw new Error(
              error?.message ?? result?.error ?? "Failed to analyze form",
            );
          }

          // Transform the BAML result into the expected format
          const analyzedData = result.data
            ? {
                approvedActivities: result.data.approvedActivities.map(
                  (activity) => ({
                    activity: activity.activity,
                    isApproved: activity.isApproved,
                  }),
                ),
                breed: result.data.breed,
                difficultyLevel: result.data
                  .difficultyLevel as DifficultyLevelEnum,
                equipmentNotes: {
                  inKennel: result.data.equipmentNotes.inKennel.join("\n"),
                  outOfKennel:
                    result.data.equipmentNotes.outOfKennel.join("\n"),
                },
                externalId: result.data.id,
                gender: result.data.gender.toLowerCase() as "male" | "female",
                generalNotes: result.data.generalNotes ?? "",
                isFido: result.data.isFido,
                name: result.data.name,
              }
            : null;

          // Update the form with the analyzed data
          await db.saveIntakeForm({
            ...form,
            analyzedData,
            status: "analyzed",
          });
          toast.success("Form analyzed");
        } catch (error) {
          console.error("Error starting analysis:", error);
          toast.error("Error analyzing form");
          const errorMessage =
            error instanceof Error ? error.message : "Failed to analyze form";
          await db.saveIntakeForm({
            ...form,
            error: errorMessage,
            status: "error",
          });
        }
      }
    }

    void processSuccessfulUploads();
  }, [db, uploads]);

  const getFormByKennelId = async (
    kennelId: string,
  ): Promise<IntakeFormAnalysis | null> => {
    return db.getIntakeFormByKennelId(kennelId);
  };

  const getFormByAnimalId = async (
    animalId: string,
  ): Promise<IntakeFormAnalysis | null> => {
    return db.getIntakeFormByAnimalId(animalId);
  };

  const assignToKennel = async (
    formId: string,
    kennelId: string,
  ): Promise<void> => {
    await db.assignIntakeFormToKennel(formId, kennelId);
  };

  return (
    <IntakeFormContext.Provider
      value={{
        assignToKennel,
        getFormByAnimalId,
        getFormByKennelId,
      }}
    >
      {children}
    </IntakeFormContext.Provider>
  );
}

export function useIntakeForm() {
  const context = useContext(IntakeFormContext);

  if (!context) {
    throw new Error("useIntakeForm must be used within IntakeFormProvider");
  }

  return context;
}
