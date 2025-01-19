/* eslint-disable unicorn/no-nested-ternary */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
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

import type { IntakeFormAnalysis } from "~/providers/indexed-db-provider";
import { useIndexedDB } from "~/providers/indexed-db-provider";
import { useIntakeForm } from "~/providers/intake-form-provider";
import { createAnimalAction } from "./actions";

interface AnimalFormData {
  externalId?: string;
  name: string;
  breed?: string | null;
  gender?: GenderEnum;
  difficultyLevel?: DifficultyLevelEnum;
  isFido?: boolean;
  intakeFormImagePath?: string | null;
  generalNotes?: string;
  approvedActivities?: {
    activity?: string;
    isApproved?: boolean;
  }[];
  equipmentNotes?: {
    inKennel?: string;
    outOfKennel?: string;
  };
  staffLeashUp?: boolean;
  staffReturn?: boolean;
}

interface AnimalFormProps {
  kennelId: string;
  shelterId: string;
  roomId: string;
  initialData?: AnimalFormData;
}

function useDebounce<T>(callback: (value: T) => Promise<void>, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (value: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        void callback(value);
        timeoutRef.current = null;
      }, delay);
    },
    [callback, delay],
  );
}

export function AnimalForm({
  kennelId,
  shelterId,
  roomId,
  initialData,
}: AnimalFormProps) {
  const router = useRouter();
  const { execute, isPending, isSuccess } = useServerAction(
    createAnimalAction,
    {
      onError: (error) => {
        console.error("Failed to add dog", error);
        toast.error(`Failed to add dog: ${error.err.message}`);
      },
      onSuccess: () => {
        void (async () => {
          try {
            // Clear both the upload and intake form from IndexedDB
            if (currentFormIdRef.current) {
              await db.removeIntakeForm(currentFormIdRef.current);
            }
            const existingUpload = await db.getUploadByKennelId(kennelId);
            if (existingUpload) {
              await db.removeUpload(existingUpload.id);
            }
            toast.success("Animal added successfully");
            router.push(`/shelters/${shelterId}/rooms/${roomId}/kennels`);
          } catch (error) {
            console.error("Failed to clean up IndexedDB:", error);
            // Still show success since the animal was created and redirect
            toast.success("Animal added successfully, but cleanup failed");
            router.push(`/shelters/${shelterId}/rooms/${roomId}/kennels`);
          }
        })();
      },
    },
  );

  const { getFormByKennelId } = useIntakeForm();
  const db = useIndexedDB();
  const currentFormIdRef = useRef<string | null>(null);
  const hasLoadedRef = useRef(false);

  const upload = useLiveQuery(
    async () => {
      return db.getUploadByKennelId(kennelId);
    },
    [kennelId],
    null,
  );

  const [formData, setFormData] = useState<AnimalFormData>(
    initialData ?? {
      approvedActivities: [
        { activity: "FIDO", isApproved: false },
        { activity: "Dog Playgroups", isApproved: false },
        { activity: "Conference room play, quiet time", isApproved: false },
      ],
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
      staffLeashUp: false,
      staffReturn: false,
    },
  );

  const syncToIndexedDB = useCallback(
    async (data: AnimalFormData) => {
      if (currentFormIdRef.current) {
        // Update existing form
        const intakeForm = await db.getIntakeFormById(currentFormIdRef.current);
        if (intakeForm) {
          const updatedForm: IntakeFormAnalysis = {
            ...intakeForm,
            analyzedData: {
              approvedActivities: data.approvedActivities,
              breed: data.breed ?? "",
              difficultyLevel: data.difficultyLevel ?? "Yellow",
              equipmentNotes: data.equipmentNotes,
              externalId: data.externalId ?? "",
              gender: data.gender ?? "male",
              generalNotes: data.generalNotes ?? "",
              isFido: data.isFido ?? false,
              name: data.name,
              staffLeashUp: data.staffLeashUp,
              staffReturn: data.staffReturn,
            },
            status: "editing" as const,
          };
          await db.saveIntakeForm(updatedForm);
        }
      } else {
        // Create new form
        const newForm: IntakeFormAnalysis = {
          analyzedData: {
            approvedActivities: data.approvedActivities,
            breed: data.breed ?? "",
            difficultyLevel: data.difficultyLevel ?? "Yellow",
            equipmentNotes: data.equipmentNotes,
            externalId: data.externalId ?? "",
            gender: data.gender ?? "male",
            generalNotes: data.generalNotes ?? "",
            isFido: data.isFido ?? false,
            name: data.name,
            staffLeashUp: data.staffLeashUp,
            staffReturn: data.staffReturn,
          },
          createdAt: new Date(),
          id: createId(),
          kennelId,
          previewUrl: "",
          roomId,
          shelterId,
          status: "editing" as const,
          uploadedUrl: data.intakeFormImagePath ?? "",
        };
        currentFormIdRef.current = newForm.id;
        await db.saveIntakeForm(newForm);
      }
    },
    [db, kennelId, roomId, shelterId],
  );

  const debouncedSync = useDebounce(syncToIndexedDB, 1000);

  // Load initial data from IndexedDB only once
  useEffect(() => {
    async function loadIntakeFormData() {
      // If we've already loaded the data, don't load it again
      if (hasLoadedRef.current) return;

      const intakeForm = await getFormByKennelId(kennelId);

      if (intakeForm?.analyzedData) {
        currentFormIdRef.current = intakeForm.id;
        const { analyzedData } = intakeForm;
        setFormData({
          approvedActivities: analyzedData.approvedActivities?.map(
            (activity) => ({
              activity: activity.activity,
              isApproved: activity.isApproved,
            }),
          ),
          breed: analyzedData.breed,
          difficultyLevel: analyzedData.difficultyLevel,
          equipmentNotes: analyzedData.equipmentNotes,
          externalId: analyzedData.externalId,
          gender: analyzedData.gender,
          generalNotes: analyzedData.generalNotes,
          intakeFormImagePath: intakeForm.uploadedUrl,
          isFido: analyzedData.isFido,
          name: analyzedData.name ?? "Unknown",
          staffLeashUp: analyzedData.staffLeashUp,
          staffReturn: analyzedData.staffReturn,
        });

        // Update the form status to editing
        await db.saveIntakeForm({
          ...intakeForm,
          status: "editing" as const,
        });

        hasLoadedRef.current = true;
      }
    }

    void loadIntakeFormData();
  }, [kennelId, getFormByKennelId, db]);

  const handleFormChange = (newData: AnimalFormData) => {
    setFormData(newData);
    debouncedSync(newData);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await execute({
      ...formData,
      breed: formData.breed ?? "",
      difficultyLevel: formData.difficultyLevel ?? "Yellow",
      gender: formData.gender ?? "male",
      intakeFormImagePath: formData.intakeFormImagePath ?? undefined,
      kennelId,
      shelterId,
    });
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <input type="hidden" name="kennelId" value={kennelId} />

      {/* Image Preview Section */}
      {upload?.previewUrl ? (
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={upload.previewUrl}
            alt="Intake form preview"
            className="h-full w-full object-cover"
          />
        </div>
      ) : formData.intakeFormImagePath ? (
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
          <Image
            src={formData.intakeFormImagePath}
            alt="Intake form"
            fill
            className="object-cover"
          />
        </div>
      ) : null}

      {/* Basic Information Section */}
      <div className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="id">Animal ID</Label>
          <Input
            id="id"
            name="id"
            value={formData.externalId}
            onChange={(event) =>
              handleFormChange({
                ...formData,
                externalId: event.target.value,
              })
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
              handleFormChange({
                ...formData,
                name: event.target.value,
              })
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="breed">Breed</Label>
          <Input
            id="breed"
            name="breed"
            value={formData.breed ?? ""}
            onChange={(event) =>
              handleFormChange({
                ...formData,
                breed: event.target.value,
              })
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            name="gender"
            value={formData.gender}
            onValueChange={(value) =>
              handleFormChange({
                ...formData,
                gender: value as GenderEnum,
              })
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
              handleFormChange({
                ...formData,
                difficultyLevel: value as DifficultyLevelEnum,
              })
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
      </div>

      {/* Notes Section */}
      <div className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="generalNotes">General Notes</Label>
          <Textarea
            id="generalNotes"
            name="generalNotes"
            value={formData.generalNotes}
            onChange={(event) =>
              handleFormChange({
                ...formData,
                generalNotes: event.target.value,
              })
            }
            className="min-h-[100px]"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="inKennelNotes">In-Kennel Equipment Notes</Label>
          <Textarea
            id="inKennelNotes"
            name="equipmentNotes.inKennel"
            value={formData.equipmentNotes?.inKennel ?? ""}
            onChange={(event) =>
              handleFormChange({
                ...formData,
                equipmentNotes: {
                  ...formData.equipmentNotes,
                  inKennel: event.target.value,
                },
              })
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="outKennelNotes">Out-of-Kennel Equipment Notes</Label>
          <Textarea
            id="outKennelNotes"
            name="equipmentNotes.outOfKennel"
            value={formData.equipmentNotes?.outOfKennel ?? ""}
            onChange={(event) =>
              handleFormChange({
                ...formData,
                equipmentNotes: {
                  ...formData.equipmentNotes,
                  outOfKennel: event.target.value,
                },
              })
            }
          />
        </div>
      </div>

      {/* Toggles Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="staffLeashUp"
            name="staffLeashUp"
            checked={formData.staffLeashUp}
            onCheckedChange={(checked) =>
              handleFormChange({
                ...formData,
                staffLeashUp: checked,
              })
            }
          />
          <Label htmlFor="staffLeashUp">Staff Required for Leash Up</Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="staffReturn"
            name="staffReturn"
            checked={formData.staffReturn}
            onCheckedChange={(checked) =>
              handleFormChange({
                ...formData,
                staffReturn: checked,
              })
            }
          />
          <Label htmlFor="staffReturn">Staff Required for Return</Label>
        </div>

        <Label>Approved Activities</Label>
        {formData.approvedActivities?.map((activity, index) => (
          <div key={index} className="flex items-center gap-4">
            <Switch
              id={`approvedActivities.${index}.isApproved`}
              name={`approvedActivities.${index}.isApproved`}
              checked={activity.isApproved}
              onCheckedChange={(checked) =>
                handleFormChange({
                  ...formData,
                  approvedActivities: formData.approvedActivities?.map(
                    (a, index_) =>
                      index_ === index ? { ...a, isApproved: checked } : a,
                  ),
                })
              }
            />
            <Label htmlFor={`approvedActivities.${index}.isApproved`}>
              {activity.activity}
            </Label>
          </div>
        ))}
      </div>

      <Button
        type="submit"
        disabled={
          isPending || isSuccess || !formData.name || !formData.difficultyLevel
        }
      >
        {isPending && (
          <>
            <Icons.Spinner className="mr-2" />
            Adding Dog...
          </>
        )}
        {isSuccess && "Dog Added"}
        {!isPending && !isSuccess && "Add Dog"}
      </Button>
    </form>
  );
}
