"use client";

import type { AnimalTypeWithRelations, KennelType } from "@acme/db/schema";
import { Drawer, DrawerContent, DrawerHeader } from "@acme/ui/drawer";
import { cn } from "@acme/ui/lib/utils";

import { useDrawer } from "~/providers/drawer-provider";
import { KennelCellDialogContent } from "./content";
import { KennelCellDialogHeader } from "./header";

interface KennelActionsDrawerProps {
  animal?: AnimalTypeWithRelations;
  kennel: KennelType;
  kennels: KennelType[];
}

export function KennelCellDialogDrawer({
  animal,
  kennel,
  kennels,
}: KennelActionsDrawerProps) {
  const {
    snapPoints,
    activeSnapPoint,
    setActiveSnapPoint,
    open,
    onOpenChange,
  } = useDrawer();

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
    >
      <DrawerContent
        className={cn({
          "border-t-4 border-t-purple": animal?.difficultyLevel === "Purple",
          "border-t-4 border-t-red": animal?.difficultyLevel === "Red",
          "border-t-4 border-t-yellow": animal?.difficultyLevel === "Yellow",
        })}
      >
        <div className="mx-auto w-full">
          <DrawerHeader>
            <KennelCellDialogHeader
              animal={animal}
              kennel={kennel}
              variant="drawer"
            />
          </DrawerHeader>

          <div className="px-4">
            <KennelCellDialogContent
              animal={animal}
              roomId={kennel.room.id}
              kennelId={kennel.id}
              kennels={kennels}
              onOpenChange={onOpenChange}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
