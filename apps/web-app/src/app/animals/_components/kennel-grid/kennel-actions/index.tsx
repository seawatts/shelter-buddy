"use client";

import { useState } from "react";

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

const snapPoints = ["50%", "70%", 1] as const;

export function KennelActions({
  animal,
  kennel,
  open,
  onOpenChange,
}: KennelActionsProps) {
  const isMobile = useIsMobile();
  const [activeSnapPoint, setActiveSnapPoint] = useState<
    string | number | null
  >(snapPoints[0]);

  if (isMobile) {
    return (
      <KennelActionsDrawer
        animal={animal}
        kennel={kennel}
        open={open}
        onOpenChange={onOpenChange}
        snapPoints={snapPoints}
        activeSnapPoint={activeSnapPoint}
        setActiveSnapPoint={setActiveSnapPoint}
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
