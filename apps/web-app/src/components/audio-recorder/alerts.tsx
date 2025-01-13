import React from "react";

import { Alert, AlertDescription, AlertTitle } from "@acme/ui/alert";
import { Icons } from "@acme/ui/icons";

import { useAudioRecorderContext } from "./context/audio-recorder-context";
import { useVolumeMonitorContext } from "./context/volume-monitor-context";
import { formatTimeReadable } from "./format-time";

export interface AlertsProps {
  maxRecordingTimeSeconds?: number;
  warningRecordingTimeSeconds?: number;
}

export function Alerts({
  maxRecordingTimeSeconds = 120,
  warningRecordingTimeSeconds = 60,
}: AlertsProps) {
  const { isLowVolume } = useVolumeMonitorContext();
  const { isRecording, recordingTime } = useAudioRecorderContext();

  return (
    <>
      {recordingTime > warningRecordingTimeSeconds &&
        recordingTime <= maxRecordingTimeSeconds && (
          <Alert variant="destructive">
            <Icons.AlertTriangle />
            <AlertTitle>Time warning</AlertTitle>
            <AlertDescription>
              Try to keep your answer under{" "}
              {formatTimeReadable(warningRecordingTimeSeconds)}. Recording will
              automatically stop at{" "}
              {formatTimeReadable(maxRecordingTimeSeconds)}.
            </AlertDescription>
          </Alert>
        )}

      {recordingTime > maxRecordingTimeSeconds && (
        <Alert variant="destructive">
          <Icons.AlertTriangle />
          <AlertTitle>Recording stopped</AlertTitle>
          <AlertDescription>
            The recording has been automatically stopped after{" "}
            {formatTimeReadable(maxRecordingTimeSeconds)}.
          </AlertDescription>
        </Alert>
      )}

      {isLowVolume && isRecording && (
        <Alert variant="destructive">
          <Icons.Mic />
          <AlertTitle>Low volume or frequent pauses detected</AlertTitle>
          <AlertDescription>
            Speak louder and maintain a steady pace for a more confident
            delivery.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
