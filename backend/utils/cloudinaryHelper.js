const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Cloudinary Upload Utilities
 */

// Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'service-requests',
      ...options
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Upload multiple files
const uploadMultipleToCloudinary = async (files, options = {}) => {
  try {
    const uploads = files.map(file => uploadToCloudinary(file.buffer, {
      ...options,
      public_id: `${options.folder || 'uploads'}/${Date.now()}_${file.originalname}`
    }));

    const urls = await Promise.all(uploads);
    return urls;
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw error;
  }
};

// Delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary
};