import type { useUser } from "@clerk/nextjs";

import { env } from "~/env.server";

export async function speechToText({
  audioBlob,
  user,
}: {
  audioBlob: Blob;
  user: ReturnType<typeof useUser>;
}): Promise<string> {
  if (!user) {
    throw new Error("User is required");
  }

  const endpoint = "/api/speech-to-text";
  const apiUrl =
    env.NODE_ENV === "production"
      ? `https://app.co-founder.ai${endpoint}`
      : `http://localhost:3000${endpoint}`;

  const formData = new FormData();
  formData.append("audio", audioBlob);
  formData.append("userId", user.user?.id ?? "");

  const response = await fetch(apiUrl, {
    body: formData,
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch text from audio");
  }

  const textResponse = await response.json();
  return textResponse.text;
}
