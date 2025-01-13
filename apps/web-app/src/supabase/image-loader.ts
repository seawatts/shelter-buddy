import { env } from "~/env.client";

const projectId = env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;

export default function supabaseLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality: number;
}) {
  return `https://${projectId}.supabase.co/storage/v1/render/image/public/${src}?width=${width}&quality=${quality || 75}`;
}
