export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ProcessedImage {
  file: File;
  dimensions: ImageDimensions;
  preview: string;
  previewBase64: string;
}

function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener("load", () => resolve(reader.result as string));
    reader.addEventListener("error", () =>
      reject(new Error("Failed to read file")),
    );
  });
}

export class ImageProcessor {
  private static MAX_WIDTH = 2048; // Max width for uploaded images
  private static MAX_HEIGHT = 2048; // Max height for uploaded images
  private static QUALITY = 0.8; // JPEG quality (0.0 to 1.0)

  static async processImage(file: File): Promise<ProcessedImage> {
    // Create an image object
    const img = new Image();
    const imageUrl = URL.createObjectURL(file);

    try {
      // Load the image
      await new Promise((resolve, reject) => {
        img.addEventListener("load", resolve);
        img.addEventListener("error", reject);
        img.src = imageUrl;
      });

      // Calculate new dimensions while maintaining aspect ratio
      const dimensions = this.calculateDimensions(img.width, img.height);

      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      // Draw and resize image
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Could not get canvas context");
      }

      // Use better quality scaling
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      // Draw image with resize
      context.drawImage(img, 0, 0, dimensions.width, dimensions.height);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          "image/jpeg",
          this.QUALITY,
        );
      });

      // Create new file
      const processedFile = new File([blob], file.name, {
        lastModified: Date.now(),
        type: "image/jpeg",
      });

      // Create preview URL
      const previewUrl = URL.createObjectURL(processedFile);
      const base64Preview = await getBase64(processedFile);

      return {
        dimensions,
        file: processedFile,
        preview: previewUrl,
        previewBase64: base64Preview,
      };
    } finally {
      // Clean up the original object URL
      URL.revokeObjectURL(imageUrl);
    }
  }

  private static calculateDimensions(
    width: number,
    height: number,
  ): ImageDimensions {
    let newWidth = width;
    let newHeight = height;

    // If the image is larger than maximum dimensions, scale it down
    if (width > this.MAX_WIDTH || height > this.MAX_HEIGHT) {
      const ratio = Math.min(this.MAX_WIDTH / width, this.MAX_HEIGHT / height);
      newWidth = Math.round(width * ratio);
      newHeight = Math.round(height * ratio);
    }

    return {
      height: newHeight,
      width: newWidth,
    };
  }
}
