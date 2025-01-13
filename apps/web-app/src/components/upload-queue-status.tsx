"use client";

import { useEffect, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Progress } from "@acme/ui/progress";

import { useUploadQueue } from "~/providers/upload-queue-provider";

export function UploadQueueStatus() {
  const queue = useUploadQueue((state) => state.queue);
  const removeFromQueue = useUploadQueue((state) => state.removeFromQueue);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    globalThis.addEventListener("online", updateOnlineStatus);
    globalThis.addEventListener("offline", updateOnlineStatus);

    return () => {
      globalThis.removeEventListener("online", updateOnlineStatus);
      globalThis.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (queue.length === 0) return null;

  const pendingUploads = queue.filter((item) => item.status === "pending");
  const uploadingItems = queue.filter((item) => item.status === "uploading");
  const errorItems = queue.filter((item) => item.status === "error");

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm rounded-lg bg-background p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="size-4" />
          <span className="font-medium">Upload Queue</span>
          {!isOnline && (
            <span className="text-sm text-muted-foreground">(Offline)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? "+" : "-"}
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <div className="mt-4 space-y-4">
          {queue.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.status === "uploading" && (
                    <Loader2 className="size-3 animate-spin" />
                  )}
                  <span className="text-sm">
                    {item.file.name} ({Math.round(item.file.size / 1024)}KB)
                  </span>
                </div>
                {item.status !== "uploading" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-6 p-0"
                    onClick={() => removeFromQueue(item.id)}
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </div>
              {item.status === "uploading" && (
                <Progress value={item.progress} className="h-1" />
              )}
              {item.status === "error" && (
                <p className="text-xs text-destructive">{item.error}</p>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between border-t pt-2 text-sm text-muted-foreground">
            <span>
              {pendingUploads.length} pending • {uploadingItems.length}{" "}
              uploading • {errorItems.length} failed
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
