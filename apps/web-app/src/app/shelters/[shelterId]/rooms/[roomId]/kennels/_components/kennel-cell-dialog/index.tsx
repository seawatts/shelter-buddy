"use client";

import type { AnimalTypeWithRelations, KennelType } from "@acme/db/schema";
import { useIsMobile } from "@acme/ui/hooks/use-mobile";

import { DrawerProvider } from "../../../../../../../../providers/drawer-provider";
import { KennelCellDialogDialog } from "./dialog";
import { KennelCellDialogDrawer } from "./drawer";

interface KennelActionsProps {
  animal?: AnimalTypeWithRelations;
  kennel: KennelType;
  kennels: KennelType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KennelCellDialog({
  animal,
  kennel,
  kennels,
  open,
  onOpenChange,
}: KennelActionsProps) {
  const isMobile = useIsMobile();

  return (
    <DrawerProvider
      snapPoints={[animal ? 1 : "445px"]}
      open={open}
      onOpenChange={onOpenChange}
    >
      {isMobile ? (
        <KennelCellDialogDrawer
          animal={animal}
          kennel={kennel}
          kennels={kennels}
        />
      ) : (
        <KennelCellDialogDialog
          animal={animal}
          kennel={kennel}
          kennels={kennels}
          open={open}
          onOpenChange={onOpenChange}
        />
      )}
    </DrawerProvider>
  );
}
