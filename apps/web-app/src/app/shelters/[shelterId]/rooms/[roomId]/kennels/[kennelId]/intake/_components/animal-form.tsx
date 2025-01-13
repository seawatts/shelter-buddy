"use client";

import { useState } from "react";
import { useServerAction } from "zsa-react";

import type { DifficultyLevelEnum, GenderEnum } from "@acme/db/schema";
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

import { createAnimalAction } from "./actions";

interface AnimalFormData {
  animalId: string;
  externalId: string;
  name: string;
  breed: string;
  gender: GenderEnum;
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

interface AnimalFormProps {
  kennelId: string;
  shelterId: string;
  roomId: string;
  initialData?: AnimalFormData;
}

export function AnimalForm({ kennelId, initialData }: AnimalFormProps) {
  const { execute, isPending, isSuccess } = useServerAction(
    createAnimalAction,
    {
      onError: (error) => {
        console.error("Failed to add animal", error);
        toast.error(`Failed to add animal: ${error.err.message}`);
      },
      onSuccess: () => {
        toast.success("Animal added successfully");
      },
    },
  );

  const [formData, setFormData] = useState<AnimalFormData>(
    initialData ?? {
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
    },
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    formData.append("kennelId", kennelId);
    await execute(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="kennelId" value={kennelId} />
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
            setFormData((previous) => ({
              ...previous,
              isFido: Boolean(checked),
            }))
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
        <Label htmlFor="outKennelNotes">Out-of-Kennel Equipment Notes</Label>
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
  );
}
