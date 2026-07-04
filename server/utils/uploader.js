import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary if credentials are provided in env
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary service integrated successfully.');
} else {
  console.log('Cloudinary keys missing. Falling back to local filesystem storage.');
}

/**
 * Uploads a file. If Cloudinary is available, uploads there.
 * Otherwise, returns the local static uploads URL.
 * 
 * @param {Object} file Multer file object
 * @param {String} folder Target folder name on Cloudinary
 * @returns {Object} { url, publicId }
 */
export const uploadFile = async (file, folder = 'career_connect') => {
  if (!file) return { url: '', publicId: '' };

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: folder,
        resource_type: 'auto', // Auto-detect images or PDFs
      });
      // Delete temporary file from local storage
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      // Fallback to local storage if Cloudinary fails
    }
  }

  // Local storage fallback path
  const localUrl = `/uploads/${file.filename}`;
  return {
    url: localUrl,
    publicId: file.filename, // Use filename as mock public ID
  };
};

/**
 * Deletes a file.
 * 
 * @param {String} publicId The public ID of the file
 */
export const deleteFile = async (publicId) => {
  if (!publicId) return;

  if (isCloudinaryConfigured && !publicId.includes('.')) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary deletion error:', error);
    }
  } else {
    // Local deletion fallback
    const localFilePath = path.join(process.cwd(), 'uploads', publicId);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
};
