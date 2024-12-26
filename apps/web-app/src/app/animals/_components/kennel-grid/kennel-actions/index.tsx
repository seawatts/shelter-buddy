"use client";

import { useIsMobile } from "@acme/ui/hooks/use-mobile";

import type { Animal, Kennel } from "../../../types";
import { KennelActionsDialog } from "./kennel-actions-dialog";
import { KennelActionsDrawer } from "./kennel-actions-drawer";

interface KennelActionsProps {
  animal: Animal | undefined;
  kennel: Kennel;
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

  if (isMobile) {
    return (
      <KennelActionsDrawer
        animal={animal}
        kennel={kennel}
        open={open}
        onOpenChange={onOpenChange}
      />
    );
  }

  return (
    <KennelActionsDialog
      animal={animal}
      kennel={kennel}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
