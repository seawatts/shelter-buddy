"use client";

import type { AnimalTypeWithRelations, KennelType } from "@acme/db/schema";
import { useIsMobile } from "@acme/ui/hooks/use-mobile";

import { KennelActionsDialog } from "./kennel-actions-dialog";
import { KennelActionsDrawer } from "./kennel-actions-drawer";

interface KennelActionsProps {
  animal?: AnimalTypeWithRelations;
  kennel: KennelType;
  kennels: KennelType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KennelActions({
  animal,
  kennel,
  kennels,
  open,
  onOpenChange,
}: KennelActionsProps) {
  const isMobile = useIsMobile();

  return isMobile ? (
    <KennelActionsDrawer
      animal={animal}
      kennel={kennel}
      kennels={kennels}
      open={open}
      onOpenChange={onOpenChange}
    />
  ) : (
    <KennelActionsDialog
      animal={animal}
      kennel={kennel}
      kennels={kennels}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
