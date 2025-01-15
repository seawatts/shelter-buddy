"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";

import { cn } from "@acme/ui/lib/utils";

import { useIndexedDB } from "~/providers/indexed-db-provider";

interface KennelUploadStatusProps {
  kennelId: string;
  className?: string;
}

export function KennelUploadStatus({
  kennelId,
  className,
}: KennelUploadStatusProps) {
  const db = useIndexedDB();

  const form = useLiveQuery(
    async () => {
      if (!db.isInitialized) return null;
      return db.getIntakeFormByKennelId(kennelId);
    },
    [kennelId, db],
    null,
  );

  const upload = useLiveQuery(
    async () => {
      if (!db.isInitialized) return null;
      return db.getUploadByKennelId(kennelId);
    },
    [kennelId, db],
    null,
  );

  if (!form?.status && !upload?.status) return null;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {upload?.status === "pending" && (
        <>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Preparing Upload...
          </span>
        </>
      )}
      {upload?.status === "uploading" && (
        <>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Uploading... {Math.round(upload.progress)}%
          </span>
        </>
      )}
      {upload?.status === "error" && (
        <>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="size-4 text-destructive" />
            Upload Error. Try again.
          </span>
        </>
      )}
      {form?.status === "pending" && (
        <>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Uploading...
          </span>
        </>
      )}
      {form?.status === "analyzing" && (
        <>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Analyzing...
          </span>
        </>
      )}
      {form?.status === "analyzed" && (
        <>
          <Link
            href={`/shelters/${form.shelterId}/rooms/${form.roomId}/kennels/${form.kennelId}/intake`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-muted-foreground/80"
          >
            Complete Animal Details
            <ArrowRight className="size-4" />
          </Link>
        </>
      )}
      {form?.status === "editing" && (
        <>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Editing...
          </span>
        </>
      )}
      {form?.status === "error" && (
        <>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="size-4 text-destructive" />
            Error Analyzing. Try again.
          </span>
        </>
      )}
    </div>
  );
}
