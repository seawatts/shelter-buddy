"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";

import { PhotoCapture } from "./photo-capture";

interface WalkTimerProps {
  walkId: string;
}

export function WalkTimer({ walkId }: WalkTimerProps) {
  const router = useRouter();
  const [startTime] = useState(() => new Date());
  const [elapsedTime, setElapsedTime] = useState("0:00");
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diffInSeconds = Math.floor(
        (now.getTime() - startTime.getTime()) / 1000,
      );
      const minutes = Math.floor(diffInSeconds / 60);
      const seconds = diffInSeconds % 60;
      setElapsedTime(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const handleEndWalk = () => {
    router.push(
      `/animals/walks/${walkInProgress.id}/finished?startTime=${startTime.toISOString()}&elapsedTime=${elapsedTime}`,
    );
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8">
      <div className="text-center">
        <div className="text-6xl font-bold">{elapsedTime}</div>
        <p className="mt-2 text-muted-foreground">Time Elapsed</p>
      </div>

      <PhotoCapture photos={photos} onPhotosTaken={setPhotos} />

      <div className="flex w-full max-w-sm flex-col gap-4">
        <Button
          variant="destructive"
          size="lg"
          className="w-full"
          onClick={handleEndWalk}
        >
          End Walk
        </Button>
      </div>
    </div>
  );
}
