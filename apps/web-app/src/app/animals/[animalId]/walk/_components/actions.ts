"use server";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

interface TranscriptionResult {
  notes: string;
  activities: string[];
}

export async function transcribeAudio(audioFile: File) {
  try {
    console.log("Transcribing audio...");
    const arrayBuffer = await audioFile.arrayBuffer();

    const result = await generateText({
      messages: [
        {
          content: [
            { text: "What is the audio saying?", type: "text" },
            {
              data: arrayBuffer,
              mimeType: audioFile.type,
              type: "file",
            },
          ],
          role: "user",
        },
      ],
      model: openai("gpt-4o-audio-preview"),
    });

    console.log("Transcription complete:", result);

    return {
      object: {
        activities: [],
        notes: result.text || "",
      } satisfies TranscriptionResult,
      success: true,
    };
  } catch (error) {
    console.error("Transcription error:", error);
    return { error: "Failed to transcribe audio", success: false };
  }
}
