/**
 * Image utility functions for client-side processing
 */
import logger from "@/utils/core/common/logger";

/**
 * Resizes an image to a maximum dimension while maintaining aspect ratio
 * @param file - The image file to resize
 * @param maxDimension - The maximum width or height (default 1280)
 * @returns A promise that resolves to a new Blob containing the resized image
 */
export const resizeImage = async (
  file: File | Blob,
  maxDimension: number = 1280
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Only resize if one of the dimensions exceeds the maximum
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      } else {
        // No resizing needed
        resolve(file);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Use better image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            logger.info("📸 Image resized", {
              originalSize: file.size,
              newSize: blob.size,
              dimensions: `${width}x${height}`,
            });
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        file.type || "image/jpeg",
        0.9 // Quality
      );
    };

    img.onerror = () => reject(new Error("Failed to load image for resizing"));
    reader.onerror = () => reject(new Error("Failed to read image file"));

    reader.readAsDataURL(file);
  });
};
