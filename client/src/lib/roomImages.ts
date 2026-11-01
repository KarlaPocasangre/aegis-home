import { useSyncExternalStore } from "react";

// Photos are never stored by the app: the preview lives only in this tab's memory.
// After a reload the plan is still there, but the photo has to be uploaded again to see highlights.
const images = new Map<string, string>();
const listeners = new Set<() => void>();
let version = 0;

function emit() {
  version++;
  for (const listener of listeners) listener();
}

export const roomImages = {
  /** `url` is an object URL (owned and revoked here) or a static sample path. */
  set(roomId: string, url: string) {
    const previous = images.get(roomId);
    if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
    images.set(roomId, url);
    emit();
  },
  clear() {
    for (const url of images.values()) if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    images.clear();
    emit();
  },
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useRoomImage(roomId: string): string | undefined {
  useSyncExternalStore(subscribe, () => version);
  return images.get(roomId);
}
