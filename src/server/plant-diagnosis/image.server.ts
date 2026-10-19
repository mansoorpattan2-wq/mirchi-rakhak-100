import sharp from "sharp";
import { DiagnosisError, MAX_IMAGE_BYTES } from "../../lib/diagnosis-contract";

function detectImageType(bytes: Uint8Array): "jpeg" | "png" | "webp" | null {
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "jpeg";
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b)) return "png";
  if (
    Buffer.from(bytes.subarray(0, 4)).toString() === "RIFF" &&
    Buffer.from(bytes.subarray(8, 12)).toString() === "WEBP"
  )
    return "webp";
  return null;
}

export async function prepareImage(file: File): Promise<Uint8Array> {
  if (!file.size)
    throw new DiagnosisError("INVALID_IMAGE", 400, "The image is empty. Choose another photo.");
  if (file.size > MAX_IMAGE_BYTES)
    throw new DiagnosisError("IMAGE_TOO_LARGE", 413, "Choose a photo smaller than 4 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const format = detectImageType(bytes);
  if (!format)
    throw new DiagnosisError("UNSUPPORTED_IMAGE", 415, "Choose an actual JPEG, PNG or WebP image.");
  try {
    const image = sharp(bytes, {
      failOn: "warning",
      limitInputPixels: 24_000_000,
      animated: false,
    });
    const metadata = await image.metadata();
    if (
      metadata.format !== format ||
      !metadata.width ||
      !metadata.height ||
      (metadata.pages ?? 1) !== 1
    )
      throw new Error("Invalid or animated image");
    // Full decode validates content. Auto-orient before resizing; stripping metadata removes GPS/EXIF.
    return await image
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 90 })
      .toBuffer();
  } catch {
    throw new DiagnosisError(
      "INVALID_IMAGE",
      400,
      "This photo could not be decoded, is animated or exceeds 24 megapixels. Choose a clear JPEG, PNG or WebP photo.",
    );
  }
}
