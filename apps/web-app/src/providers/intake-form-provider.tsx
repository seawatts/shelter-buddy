"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

import { IntakeFormService } from "~/services/intake-form-service/service";
import { useIndexedDB } from "./indexed-db-provider";
import { useUploadQueue } from "./upload-queue-provider";

const IntakeFormServiceContext = createContext<IntakeFormService | null>(null);

export interface IntakeFormProviderProps {
  children: ReactNode;
}

export function IntakeFormProvider({ children }: IntakeFormProviderProps) {
  const subscribe = useUploadQueue((state) => state.subscribe);
  const db = useIndexedDB();
  const serviceRef = useMemo(
    () => new IntakeFormService(subscribe, db),
    [subscribe, db],
  );

  return (
    <IntakeFormServiceContext.Provider value={serviceRef}>
      {children}
    </IntakeFormServiceContext.Provider>
  );
}

export function useIntakeFormService() {
  const service = useContext(IntakeFormServiceContext);

  if (!service) {
    throw new Error(
      "useIntakeFormService must be used within IntakeFormProvider",
    );
  }

  return service;
}
