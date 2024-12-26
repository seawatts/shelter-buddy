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

const snapPoints = ["148px", "355px", 1] satisfies (string | number)[];

export function KennelActions({
  animal,
  kennel,
  open,
  onOpenChange,
}: KennelActionsProps) {
  const isMobile = useIsMobile();
  const [activeSnapPoint, setActiveSnapPoint] = useState<
    string | number | null
  >(snapPoints[0] as string);

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
