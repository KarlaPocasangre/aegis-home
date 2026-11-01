import { t } from "./i18n";
import { ImagePrepError } from "./image";
import type { RoomType } from "./types";

export interface SampleImage {
  url: string;
  roomType: RoomType;
  /** Key into the `samples` dictionary. */
  labelKey: "livingRoom" | "bedroom";
}

// Sample photos (no people, no metadata), optimized to ~150 KB. Their real results are recorded
// in server/fixtures so a sample still answers, labeled, if the AI service is down.
export const SAMPLE_IMAGES: SampleImage[] = [
  { url: "/samples/living-room.jpg", roomType: "living_room", labelKey: "livingRoom" },
  { url: "/samples/bedroom.jpg", roomType: "bedroom", labelKey: "bedroom" },
];

export async function fetchSample(sample: SampleImage): Promise<Blob> {
  const res = await fetch(sample.url);
  if (!res.ok) throw new ImagePrepError(t().errors.sampleLoad);
  return res.blob();
}
