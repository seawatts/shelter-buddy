"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface DrawerContextType {
  activeSnapPoint: number | string | null;
  setActiveSnapPoint: (value: number | string | null) => void;
  snapPoints: (number | string)[];
  setSnapPoints: (values: (number | string)[]) => void;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

interface DrawerProviderProps {
  children: ReactNode;
  snapPoints?: (number | string)[];
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
}

export function DrawerProvider(props?: DrawerProviderProps) {
  const [activeSnapPoint, setActiveSnapPoint] = useState<
    number | string | null
  >(props?.snapPoints?.[0] ?? null);
  const [snapPoints, setSnapPoints] = useState<(number | string)[]>(
    props?.snapPoints ?? [0.9, 0.5, 0.25],
  );
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    props?.open ?? false,
  );
  const isControlled = props?.open !== undefined;
  const open = isControlled ? props.open : uncontrolledOpen;

  const handleOpenChange = (value: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(value);
    }
    props?.onOpenChange?.(value);
  };

  return (
    <DrawerContext.Provider
      value={{
        activeSnapPoint,
        onOpenChange: handleOpenChange,
        open: open ?? false,
        setActiveSnapPoint,
        setSnapPoints,
        snapPoints,
      }}
    >
      {props?.children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return context;
}
