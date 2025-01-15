import type { ReactNode } from "react";

import type { IndexedDBContextValue } from "../indexed-db-provider";
import { useIndexedDB } from "../indexed-db-provider";

export function MockIndexedDBContext({
  children,
  value,
}: {
  children: ReactNode;
  value: IndexedDBContextValue;
}) {
  const Context = (
    useIndexedDB as unknown as {
      Context: React.Context<IndexedDBContextValue | null>;
    }
  ).Context;

  if (!Context) throw new Error("Context not found");

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
