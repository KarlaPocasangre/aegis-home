import { createHash } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { HttpError } from "./httpError.js";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const NORMALIZED_MAX_SIDE = 1024;
const MAX_INPUT_PIXELS = 40_000_000; // ~40 MP: real phone photos pass, decompression bombs don't

/** Server-resized JPEG that both Spark and SAM receive (docs/AI_INTEGRATION.md §2). */
export interface NormalizedImage {
  buffer: Buffer;
  mime: "image/jpeg";
  width: number;
  height: number;
  sha256: string;
}

export async function normalizeImage(input: Buffer): Promise<NormalizedImage> {
  // Trust magic bytes, not the client-declared MIME type.
  const detected = await fileTypeFromBuffer(input);
  if (!detected || !ALLOWED_IMAGE_MIME.has(detected.mime)) {
    throw new HttpError("UNSUPPORTED_MEDIA_TYPE");
  }

  try {
    // Re-encoding drops EXIF/GPS: sharp keeps no metadata unless asked to.
    const { data, info } = await sharp(input, {
      limitInputPixels: MAX_INPUT_PIXELS,
      failOn: "error",
      autoOrient: true,
    })
      .resize({
        width: NORMALIZED_MAX_SIDE,
        height: NORMALIZED_MAX_SIDE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: data,
      mime: "image/jpeg",
      width: info.width,
      height: info.height,
      sha256: createHash("sha256").update(data).digest("hex"),
    };
  } catch (err) {
    if (err instanceof Error && /pixel limit/i.test(err.message)) {
      throw new HttpError("PAYLOAD_TOO_LARGE");
    }
    throw new HttpError("UNSUPPORTED_MEDIA_TYPE");
  }
}
