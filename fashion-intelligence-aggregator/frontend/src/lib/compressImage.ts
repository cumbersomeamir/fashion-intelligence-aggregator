/**
 * Client-side image compression to stay under Vercel serverless body limit (~4.5 MB).
 * Resizes and re-encodes to JPEG so uploads don't hit 413 FUNCTION_PAYLOAD_TOO_LARGE.
 */

const MAX_DIMENSION = 1200;
const TARGET_MAX_BYTES = 3.5 * 1024 * 1024; // 3.5 MB to stay under 4.5 MB limit
const QUALITY_STEPS = [0.9, 0.8, 0.7, 0.6, 0.5];

function isImageFile(file: File): boolean {
  return (file.type ?? "").startsWith("image/");
}

export async function compressImageForUpload(file: File): Promise<File> {
  if (typeof window === "undefined" || !window.createImageBitmap || !isImageFile(file)) {
    return file;
  }
  if (file.size <= TARGET_MAX_BYTES) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const w = bitmap.width;
  const h = bitmap.height;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(w, h));
  const cw = Math.round(w * scale);
  const ch = Math.round(h * scale);

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, cw, ch);
  bitmap.close();

  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  for (const q of QUALITY_STEPS) {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", q);
    });
    if (!blob) continue;
    if (blob.size <= TARGET_MAX_BYTES) {
      return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
    }
  }
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.5);
  });
  return blob
    ? new File([blob], `${baseName}.jpg`, { type: "image/jpeg" })
    : file;
}
