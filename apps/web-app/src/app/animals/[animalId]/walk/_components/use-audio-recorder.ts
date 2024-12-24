import { useRef, useState } from "react";

import { transcribeAudio } from "./actions";

interface UseAudioRecorderProps {
  onTranscriptionComplete: (notes: string) => void;
}

export function useAudioRecorder({
  onTranscriptionComplete,
}: UseAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<string>("");

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 44_100,
        },
      });

      // Try to use MP3 encoding directly if supported
      let mimeType = "audio/mpeg";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
      }

      const mediaRecorder = new MediaRecorder(stream, {
        audioBitsPerSecond: 128_000,
        mimeType,
      });
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        const audioFile = new File([audioBlob], "recording.mp3", {
          lastModified: Date.now(),
          type: mimeType,
        });

        setRecordingStatus("Transcribing...");

        try {
          const result = await transcribeAudio(audioFile);
          if (result.success && result.object) {
            onTranscriptionComplete(result.object.notes);
            setRecordingStatus("");
          } else {
            setRecordingStatus("Failed to transcribe");
          }
        } catch (error) {
          console.error("Transcription error:", error);
          setRecordingStatus("Error transcribing");
        }

        for (const track of stream.getTracks()) track.stop();
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingStatus("Recording...");
    } catch (error) {
      console.error("Error starting recording:", error);
      setRecordingStatus("Error starting recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    recordingStatus,
    startRecording,
    stopRecording,
  };
}
