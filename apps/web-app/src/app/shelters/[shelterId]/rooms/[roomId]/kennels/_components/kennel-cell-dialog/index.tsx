"use client";

import type { AnimalTypeWithRelations, KennelType } from "@acme/db/schema";
import { useIsMobile } from "@acme/ui/hooks/use-mobile";

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

  return isMobile ? (
    <KennelCellDialogDrawer
      animal={animal}
      kennel={kennel}
      kennels={kennels}
      open={open}
      onOpenChange={onOpenChange}
    />
  ) : (
    <KennelCellDialogDialog
      animal={animal}
      kennel={kennel}
      kennels={kennels}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
