import { uploadImage as apiUploadImage, uploadMultipleImages as apiUploadMultiple, deleteImage as apiDeleteImage } from "@/lib/api";

/**
 * Upload a single image file to local storage
 * @param file - The image file to upload
 * @returns The path of the uploaded image, or null if upload failed
 */
export const uploadImage = async (file: File): Promise<string | null> => {
  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("Image size must be less than 5MB");
    }

    // Upload to server
    return await apiUploadImage(file);
  } catch (error) {
    console.error("Error in uploadImage:", error);
    return null;
  }
};

/**
 * Upload multiple image files to local storage
 * @param files - Array of image files to upload
 * @returns Array of paths of uploaded images
 */
export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  return apiUploadMultiple(files);
};

/**
 * Delete an image from local storage
 * @param imageUrl - The path or URL of the image to delete
 * @returns true if deletion was successful, false otherwise
 */
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    return await apiDeleteImage(imageUrl);
  } catch (error) {
    console.error("Error in deleteImage:", error);
    return false;
  }
};

