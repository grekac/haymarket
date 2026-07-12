import { v2 as cloudinary } from "cloudinary";

const configured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export function isCloudinaryConfigured() {
  return !!configured;
}

export async function uploadImage(
  buffer: Buffer,
  folder = "haymarket/listings"
): Promise<{ url: string; publicId: string }> {
  if (!configured) {
    throw new Error("Cloudinary не настроен. Добавьте ключи в .env");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", quality: "auto", fetch_format: "auto" },
      (err, result) => {
        if (err || !result) reject(err ?? new Error("Upload failed"));
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteImage(publicId: string) {
  if (!configured) return;
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
