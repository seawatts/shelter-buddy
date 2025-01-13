"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Icons } from "@acme/ui/icons";
import { cn } from "@acme/ui/lib/utils";

import { useIntakeFormService } from "~/providers/intake-form-provider";

interface KennelUploadStatusProps {
  kennelId: string;
  className?: string;
}

export function KennelUploadStatus({
  kennelId,
  className,
}: KennelUploadStatusProps) {
  const intakeFormService = useIntakeFormService();
  const [status, setStatus] = useState<
    "pending" | "analyzing" | "analyzed" | "error" | null
  >(null);

  useEffect(() => {
    void (async () => {
      const form = await intakeFormService.getFormByKennelId(kennelId);
      if (form) {
        setStatus(form.status);
      }
    })();
  }, [kennelId, intakeFormService]);

  if (!status) return null;

  return (
    <div
      className={cn(
        "absolute right-2 top-2 flex items-center gap-2 rounded-md bg-background/80 p-1 text-xs backdrop-blur-sm",
        className,
      )}
    >
      {status === "pending" && (
        <>
          <Icons.Spinner size="sm" variant="muted" />
          <span className="text-muted-foreground">Uploading...</span>
        </>
      )}
      {status === "analyzing" && (
        <>
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Analyzing...</span>
        </>
      )}
      {status === "analyzed" && (
        <>
          <Icons.Check size="sm" variant="primary" />
          <span className="text-primary">Ready</span>
        </>
      )}
      {status === "error" && (
        <>
          <Icons.AlertCircle size="sm" variant="destructive" />
          <span className="text-destructive">Error</span>
        </>
      )}
    </div>
  );
}
