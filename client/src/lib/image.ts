const MAX_SIDE = 1600; // the server normalizes to 1024; this just keeps uploads small
const MAX_INPUT_BYTES = 25 * 1024 * 1024;

export class ImagePrepError extends Error {}

/**
 * Resizes and re-encodes the photo with a canvas. Re-encoding drops EXIF/GPS metadata.
 * This protects the honest user's privacy; it is not a security control (the server repeats it).
 */
export async function prepareImage(source: Blob): Promise<Blob> {
  if (source.size > MAX_INPUT_BYTES) {
    throw new ImagePrepError("La foto es demasiado grande. Use una de menos de 25 MB.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  } catch {
    throw new ImagePrepError("No se pudo leer la imagen. Use una foto JPG, PNG o WebP.");
  }

  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new ImagePrepError("Su navegador no puede procesar la imagen.");
    ctx.drawImage(bitmap, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new ImagePrepError("No se pudo preparar la imagen.")),
        "image/jpeg",
        0.9,
      ),
    );
  } finally {
    bitmap.close();
  }
}
