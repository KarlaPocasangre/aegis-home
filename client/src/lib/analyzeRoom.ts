import { api } from "./api";
import { prepareImage } from "./image";
import { roomImages } from "./roomImages";
import type { RoomType } from "./types";

// Free of React Query on purpose: the landing page uses it, and React Query only ships with the
// evaluation chunk.
/**
 * Prepares the photo client-side, uploads it, and keeps a local preview for the overlay.
 * `previewUrl` is passed for bundled samples, which are already public files. Those are
 * uploaded byte-for-byte (small, no EXIF): canvas re-encoding varies by browser, and exact
 * bytes keep the server-side hash stable so a recorded fixture can match during an outage.
 */
export async function analyzeRoom(
  token: string,
  assessmentId: string,
  image: Blob,
  roomType: RoomType,
  previewUrl?: string,
) {
  const prepared = previewUrl ? image : await prepareImage(image);
  const room = await api.uploadRoom(token, assessmentId, roomType, prepared);
  roomImages.set(room.id, previewUrl ?? URL.createObjectURL(prepared));
  return room;
}
