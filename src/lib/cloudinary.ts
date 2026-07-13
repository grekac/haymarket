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
  return uploadMedia(buffer, { folder, resourceType: "image" });
}

export async function uploadMedia(
  buffer: Buffer,
  options: {
    folder?: string;
    resourceType: "image" | "video" | "raw";
    mimeType?: string;
  }
): Promise<{ url: string; publicId: string; duration?: number }> {
  if (!configured) {
    throw new Error("Cloudinary не настроен. Добавьте ключи в .env");
  }

  const folder = options.folder ?? "haymarket/chat";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: options.resourceType,
        quality: options.resourceType === "image" ? "auto" : undefined,
        fetch_format: options.resourceType === "image" ? "auto" : undefined,
      },
      (err, result) => {
        if (err || !result) reject(err ?? new Error("Upload failed"));
        else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            duration: result.duration ? Math.round(result.duration) : undefined,
          });
        }
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
