"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, ImageIcon, X } from "lucide-react";

import type { DifficultyLevelEnum } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";

interface AddAnimalFormData {
  breed: string;
  difficultyLevel: DifficultyLevelEnum;
  headshot: string | null;
  name: string;
}

export function AddAnimalForm() {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const headshotPhotoInputRef = useRef<HTMLInputElement>(null);
  const headshotLibraryInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<AddAnimalFormData>({
    breed: "",
    difficultyLevel: "yellow" as DifficultyLevelEnum,
    headshot: null,
    name: "",
  });

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "import" | "headshot",
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "headshot") {
          setFormData((previous) => ({
            ...previous,
            headshot: reader.result as string,
          }));
        }
        // Handle import type if needed
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 gap-2">
                <Camera className="size-4" />
                Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-[200px]">
              <DropdownMenuItem
                onClick={() => photoInputRef.current?.click()}
                className="gap-2"
              >
                <Camera className="size-4" />
                Take Photo
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => libraryInputRef.current?.click()}
                className="gap-2"
              >
                <ImageIcon className="size-4" />
                Choose from Library
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 gap-2">
                <Camera className="size-4" />
                Headshot
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-[200px]">
              <DropdownMenuItem
                onClick={() => headshotPhotoInputRef.current?.click()}
                className="gap-2"
              >
                <Camera className="size-4" />
                Take Photo
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => headshotLibraryInputRef.current?.click()}
                className="gap-2"
              >
                <ImageIcon className="size-4" />
                Choose from Library
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {formData.headshot && (
          <div className="relative mx-auto">
            <div className="relative size-32">
              <Image
                src={formData.headshot}
                alt="Headshot preview"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute -right-2 -top-2 size-6 rounded-full p-1"
              onClick={() =>
                setFormData((previous) => ({ ...previous, headshot: null }))
              }
            >
              <X className="size-4" />
            </Button>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={photoInputRef}
          onChange={(event) => handleFileChange(event, "import")}
        />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={libraryInputRef}
          onChange={(event) => handleFileChange(event, "import")}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={headshotPhotoInputRef}
          onChange={(event) => handleFileChange(event, "headshot")}
        />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={headshotLibraryInputRef}
          onChange={(event) => handleFileChange(event, "headshot")}
        />

        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
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
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select
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

        <Button
          className="mt-2"
          disabled={
            !formData.name || !formData.breed || !formData.difficultyLevel
          }
          onClick={() => {
            // TODO: Handle form submission
            console.log("Form data:", formData);
          }}
        >
          Add Animal
        </Button>
      </div>
    </div>
  );
}
