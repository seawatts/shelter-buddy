"use client";

import type { AnimalType, KennelType } from "@acme/db/schema";
import { useIsMobile } from "@acme/ui/hooks/use-mobile";

import { KennelActionsDialog } from "./kennel-actions-dialog";
import { KennelActionsDrawer } from "./kennel-actions-drawer";

interface KennelActionsProps {
  animal?: AnimalType;
  kennel: KennelType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KennelActions({
  animal,
  kennel,
  open,
  onOpenChange,
}: KennelActionsProps) {
  const isMobile = useIsMobile();

  return isMobile ? (
    <KennelActionsDrawer
      animal={animal}
      kennel={kennel}
      open={open}
      onOpenChange={onOpenChange}
    />
  ) : (
    <KennelActionsDialog
      animal={animal}
      kennel={kennel}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
