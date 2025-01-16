export interface UploadItem {
  id: string;
  file: File;
  animalId: string;
  kennelId: string;
  previewUrl: string;
  isIntakeForm: boolean;
  width: number;
  height: number;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  retryCount: number;
  createdAt: Date;
  uploadedUrl?: string;
  error?: string;
  walkId?: string;
  shelterId: string;
  roomId?: string;
}
