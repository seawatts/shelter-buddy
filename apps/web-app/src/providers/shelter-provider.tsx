"use client";

import { createContext, useContext } from "react";

import type { ShelterWithRoomsType } from "@acme/db/schema";

interface ShelterContextType {
  shelter: ShelterWithRoomsType;
}

const ShelterContext = createContext<ShelterContextType | null>(null);

export function useShelterContext() {
  const context = useContext(ShelterContext);
  if (!context) {
    throw new Error("useShelterContext must be used within a ShelterProvider");
  }
  return context;
}

export function ShelterProvider({
  children,
  shelter,
}: {
  children: React.ReactNode;
  shelter: ShelterWithRoomsType;
}) {
  return (
    <ShelterContext.Provider value={{ shelter }}>
      {children}
    </ShelterContext.Provider>
  );
}
