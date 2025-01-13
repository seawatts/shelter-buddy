import type { DifficultyLevelEnum } from "@acme/db/schema";
import { createId } from "@acme/id";

import type { IndexedDBService, IntakeFormAnalysis } from "../indexed-db";
import type { UploadQueueSubscriber } from "~/stores/upload-queue";
import { analyzeIntakeFormAction } from "./actions";

export class IntakeFormService {
  private subscribe: UploadQueueSubscriber;
  private db: IndexedDBService;
  private isClient = typeof globalThis !== "undefined";

  constructor(subscribe: UploadQueueSubscriber, db: IndexedDBService) {
    this.subscribe = subscribe;
    this.db = db;
    this.watchUploads();
  }

  private watchUploads() {
    this.subscribe((item) => {
      if (item.status === "success" && item.uploadedUrl) {
        void this.processUploadedForm(item.animalId, item.uploadedUrl);
      }
    });
  }

  private async processUploadedForm(
    animalId: string,
    uploadedUrl: string,
  ): Promise<void> {
    if (!this.isClient) return;

    // Check if we've already processed this upload
    const existing = await this.getFormByAnimalId(animalId);
    if (existing) return;

    // Create a new form entry
    const form: IntakeFormAnalysis = {
      analyzedData: null,
      animalId,
      createdAt: new Date(),
      id: createId(),
      kennelId: null,
      status: "pending",
      uploadedUrl,
    };

    // Save the initial state
    await this.db.saveIntakeForm(form);

    try {
      // Update status to analyzing
      form.status = "analyzing";
      await this.db.saveIntakeForm(form);

      // Analyze the form
      const [response] = await analyzeIntakeFormAction({
        imageUrl: uploadedUrl,
      });

      if (!response?.success || !response.data) {
        throw new Error("Failed to analyze form");
      }

      // Update with analyzed data
      form.status = "analyzed";
      form.analyzedData = {
        approvedActivities: response.data.approvedActivities,
        breed: response.data.breed,
        difficultyLevel: (response.data.difficultyLevel
          .charAt(0)
          .toUpperCase() +
          response.data.difficultyLevel
            .slice(1)
            .toLowerCase()) as DifficultyLevelEnum,
        equipmentNotes: {
          inKennel: Array.isArray(response.data.equipmentNotes.inKennel)
            ? response.data.equipmentNotes.inKennel.join("\n")
            : response.data.equipmentNotes.inKennel,
          outOfKennel: Array.isArray(response.data.equipmentNotes.outOfKennel)
            ? response.data.equipmentNotes.outOfKennel.join("\n")
            : response.data.equipmentNotes.outOfKennel,
        },
        externalId: response.data.id,
        gender: response.data.gender.toLowerCase() as "male" | "female",
        generalNotes: response.data.generalNotes ?? "",
        isFido: response.data.isFido,
        name: response.data.name,
      };
    } catch (error) {
      form.status = "error";
      form.error =
        error instanceof Error ? error.message : "Failed to analyze form";
    }

    // Save the final state
    await this.db.saveIntakeForm(form);
  }

  public async getFormByKennelId(
    kennelId: string,
  ): Promise<IntakeFormAnalysis | null> {
    if (!this.isClient) return null;
    return this.db.getIntakeFormByKennelId(kennelId);
  }

  public async getFormByAnimalId(
    animalId: string,
  ): Promise<IntakeFormAnalysis | null> {
    if (!this.isClient) return null;
    return this.db.getIntakeFormByAnimalId(animalId);
  }

  public async assignToKennel(formId: string, kennelId: string): Promise<void> {
    if (!this.isClient) return;
    await this.db.assignIntakeFormToKennel(formId, kennelId);
  }
}
