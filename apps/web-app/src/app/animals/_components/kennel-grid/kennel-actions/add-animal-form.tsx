"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Trash2 } from "lucide-react";
import { useServerAction } from "zsa-react";

import type { DifficultyLevelEnum, GenderEnum } from "@acme/db/schema";
import { createId } from "@acme/id";
import { Button } from "@acme/ui/button";
import { Icons } from "@acme/ui/icons";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Switch } from "@acme/ui/switch";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";

import { env } from "~/env.client";
import { createClient } from "~/supabase/client";
import { analyzeIntakeFormAction, createAnimalAction } from "./actions";

interface AddAnimalFormData {
  animalId: string;
  externalId: string;
  name: string;
  breed: string;
  gender: "male" | "female";
  difficultyLevel: DifficultyLevelEnum;
  isFido: boolean;
  intakeFormImagePath: string | null;
  generalNotes: string;
  approvedActivities: {
    activity: string;
    isApproved: boolean;
  }[];
  equipmentNotes: {
    inKennel?: string;
    outOfKennel?: string;
  };
}

export function AddAnimalForm({
  kennelId,
  onSubmit,
}: {
  kennelId: string;
  onSubmit: () => void;
}) {
  const { executeFormAction, isPending, isSuccess } = useServerAction(
    createAnimalAction,
    {
      onError: (error) => {
        console.error("Failed to add animal", error);
        toast.error(`Failed to add animal: ${error.err.message}`);
      },
      onSuccess: () => {
        toast.success("Animal added successfully");
        onSubmit();
      },
    },
  );

  const { execute: executeAnalyzeAction } = useServerAction(
    analyzeIntakeFormAction,
    {
      onError: (error) => {
        console.error("Failed to analyze form", error);
        toast.error(`Failed to analyze form: ${error.err.message}`);
      },
    },
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState<AddAnimalFormData>({
    animalId: "",
    approvedActivities: [],
    breed: "",
    difficultyLevel: "Yellow",
    equipmentNotes: {
      inKennel: "",
      outOfKennel: "",
    },
    externalId: "",
    gender: "male",
    generalNotes: "",
    intakeFormImagePath: null,
    isFido: false,
    name: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      try {
        // Create a local preview URL
        const localPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(localPreviewUrl);

        const supabase = createClient();
        const animalId = createId({ prefix: "animal" });

        // Generate a unique file path for the intake form
        const fileExtension = file.name.split(".").pop() ?? "png";
        const fileName = file.name.split(".")[0];
        const filePath = `${animalId}/${fileName}.${fileExtension}`;

        // Upload the file to Supabase storage
        const { data, error: uploadError } = await supabase.storage
          .from(env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET)
          .upload(filePath, file);

        if (uploadError) {
          console.error("Failed to upload image", uploadError);
          toast.error("Failed to upload image");
          throw new Error("Failed to upload image", {
            cause: uploadError,
          });
        }

        // Analyze the form using the public URL
        const result = await executeAnalyzeAction({
          imageUrl: data.path,
        });

        const response = result[0];
        if (!response) {
          console.error("Failed to analyze form", response);
          toast.error("Failed to analyze form");
          throw new Error("Failed to analyze form", {
            cause: response,
          });
        }

        if (response.success && response.data) {
          setFormData({
            ...response.data,
            animalId,
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
              outOfKennel: Array.isArray(
                response.data.equipmentNotes.outOfKennel,
              )
                ? response.data.equipmentNotes.outOfKennel.join("\n")
                : response.data.equipmentNotes.outOfKennel,
            },
            externalId: response.data.id,
            gender: response.data.gender.toLowerCase() as "male" | "female",
            generalNotes: response.data.generalNotes ?? "",
            intakeFormImagePath: data.path,
          });
          toast.success("Form analyzed successfully");
        }
      } catch (error) {
        console.error("Error processing form:", error);
        toast.error("Error processing form");
      } finally {
        setIsAnalyzing(false);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (formData: FormData) => {
    formData.append("kennelId", kennelId);
    await executeFormAction(formData);
  };

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
                setFormData((previous) => ({
                  ...previous,
                  intakeFormImagePath: null,
                }));
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}

        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="id">Animal ID</Label>
            <Input
              id="id"
              name="id"
              value={formData.externalId}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  externalId: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="breed">Breed</Label>
            <Input
              id="breed"
              name="breed"
              value={formData.breed}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  breed: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              name="gender"
              value={formData.gender}
              onValueChange={(value) =>
                setFormData((previous) => ({
                  ...previous,
                  gender: value as GenderEnum,
                }))
              }
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              name="difficultyLevel"
              value={formData.difficultyLevel}
              onValueChange={(value) =>
                setFormData((previous) => ({
                  ...previous,
                  difficultyLevel: value as DifficultyLevelEnum,
                }))
              }
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yellow">Yellow</SelectItem>
                <SelectItem value="Purple">Purple</SelectItem>
                <SelectItem value="Red">Red</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="fido"
              name="isFido"
              checked={formData.isFido}
              onCheckedChange={(checked) =>
                setFormData((previous) => ({ ...previous, isFido: checked }))
              }
            />
            <Label htmlFor="fido">FIDO Certified</Label>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="generalNotes">General Notes</Label>
            <Textarea
              id="generalNotes"
              name="generalNotes"
              value={formData.generalNotes}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  generalNotes: event.target.value,
                }))
              }
              className="min-h-[100px]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="inKennelNotes">In-Kennel Equipment Notes</Label>
            <Textarea
              id="inKennelNotes"
              name="equipmentNotes.inKennel"
              value={formData.equipmentNotes.inKennel ?? ""}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  equipmentNotes: {
                    ...previous.equipmentNotes,
                    inKennel: event.target.value,
                  },
                }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="outKennelNotes">
              Out-of-Kennel Equipment Notes
            </Label>
            <Textarea
              id="outKennelNotes"
              name="equipmentNotes.outOfKennel"
              value={formData.equipmentNotes.outOfKennel ?? ""}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  equipmentNotes: {
                    ...previous.equipmentNotes,
                    outOfKennel: event.target.value,
                  },
                }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label>Approved Activities</Label>
            {formData.approvedActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  name={`approvedActivities.${index}.activity`}
                  value={activity.activity}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      approvedActivities: previous.approvedActivities.map(
                        (a, index_) =>
                          index_ === index
                            ? { ...a, activity: event.target.value }
                            : a,
                      ),
                    }))
                  }
                />
                <Switch
                  name={`approvedActivities.${index}.isApproved`}
                  checked={activity.isApproved}
                  onCheckedChange={(checked) =>
                    setFormData((previous) => ({
                      ...previous,
                      approvedActivities: previous.approvedActivities.map(
                        (a, index_) =>
                          index_ === index ? { ...a, isApproved: checked } : a,
                      ),
                    }))
                  }
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData((previous) => ({
                  ...previous,
                  approvedActivities: [
                    ...previous.approvedActivities,
                    { activity: "", isApproved: false },
                  ],
                }))
              }
            >
              Add Activity
            </Button>
          </div>

          {formData.intakeFormImagePath && (
            <input
              type="hidden"
              name="intakeFormImagePath"
              value={formData.intakeFormImagePath}
            />
          )}

          <Button
            type="submit"
            disabled={
              isPending ||
              isSuccess ||
              !formData.name ||
              !formData.breed ||
              !formData.difficultyLevel
            }
          >
            {isPending && (
              <>
                <Icons.Spinner className="mr-2" />
                Adding Animal...
              </>
            )}
            {isSuccess && "Animal Added"}
            {!isPending && !isSuccess && "Add Animal"}
          </Button>
        </form>
      </div>
    </div>
  );
}
