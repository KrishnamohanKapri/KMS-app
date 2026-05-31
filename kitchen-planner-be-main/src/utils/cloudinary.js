const cloudinary = require('cloudinary').v2;
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "../config/config.env") });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {Buffer|string} file - File buffer or file path
 * @param {Object} options - Upload options
 * @param {string} options.folder - Folder name in Cloudinary
 * @param {string} options.public_id - Custom public ID
 * @param {Array} options.allowed_formats - Allowed image formats
 * @param {number} options.max_size - Max file size in bytes
 * @returns {Promise<Object>} Upload result
 */
const uploadImage = async (file, options = {}) => {
  try {
    const {
      folder = 'kitchen-planner',
      public_id = null,
      allowed_formats = ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      max_size = 10 * 1024 * 1024, // 10MB default
    } = options;

    // Validate file format
    const fileExtension = file.originalname?.split('.').pop()?.toLowerCase();
    if (!allowed_formats.includes(fileExtension)) {
      throw new Error(`Invalid file format. Allowed formats: ${allowed_formats.join(', ')}`);
    }

    // Validate file size
    if (file.size > max_size) {
      throw new Error(`File too large. Maximum size: ${Math.round(max_size / (1024 * 1024))}MB`);
    }

    // Prepare upload options
    const uploadOptions = {
      folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' }, // Optimize quality
        { fetch_format: 'auto' }, // Auto-format based on browser support
      ],
    };

    if (public_id) {
      uploadOptions.public_id = public_id;
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path || file.buffer, uploadOptions);

    console.log('✅ Image uploaded successfully to Cloudinary:', result.public_id);

    return {
      success: true,
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      folder: result.folder,
    };

  } catch (error) {
    console.error('❌ Image upload failed:', error.message);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} public_id - Public ID of the image
 * @returns {Promise<Object>} Deletion result
 */
const deleteImage = async (public_id) => {
  try {
    if (!public_id) {
      throw new Error('Public ID is required');
    }

    const result = await cloudinary.uploader.destroy(public_id);
    
    if (result.result === 'ok') {
      console.log('✅ Image deleted successfully from Cloudinary:', public_id);
      return { success: true, message: 'Image deleted successfully' };
    } else {
      throw new Error('Failed to delete image');
    }

  } catch (error) {
    console.error('❌ Image deletion failed:', error.message);
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

/**
 * Update image in Cloudinary (delete old, upload new)
 * @param {string} oldPublicId - Old image public ID
 * @param {Buffer|string} newFile - New file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Update result
 */
const updateImage = async (oldPublicId, newFile, options = {}) => {
  try {
    // Delete old image
    if (oldPublicId) {
      await deleteImage(oldPublicId);
    }

    // Upload new image
    const uploadResult = await uploadImage(newFile, options);

    return {
      success: true,
      oldPublicId,
      newPublicId: uploadResult.public_id,
      url: uploadResult.url,
      message: 'Image updated successfully',
    };

  } catch (error) {
    console.error('❌ Image update failed:', error.message);
    throw new Error(`Image update failed: ${error.message}`);
  }
};

/**
 * Get image information from Cloudinary
 * @param {string} public_id - Public ID of the image
 * @returns {Promise<Object>} Image information
 */
const getImageInfo = async (public_id) => {
  try {
    if (!public_id) {
      throw new Error('Public ID is required');
    }

    const result = await cloudinary.api.resource(public_id);
    
    return {
      success: true,
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      created_at: result.created_at,
      folder: result.folder,
    };

  } catch (error) {
    console.error('❌ Failed to get image info:', error.message);
    throw new Error(`Failed to get image info: ${error.message}`);
  }
};

/**
 * Generate optimized image URL with transformations
 * @param {string} public_id - Public ID of the image
 * @param {Object} transformations - Image transformations
 * @returns {string} Optimized image URL
 */
const getOptimizedImageUrl = (public_id, transformations = {}) => {
  try {
    if (!public_id) {
      throw new Error('Public ID is required');
    }

    const defaultTransformations = {
      quality: 'auto:good',
      fetch_format: 'auto',
      ...transformations,
    };

    return cloudinary.url(public_id, defaultTransformations);

  } catch (error) {
    console.error('❌ Failed to generate optimized URL:', error.message);
    throw new Error(`Failed to generate optimized URL: ${error.message}`);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  updateImage,
  getImageInfo,
  getOptimizedImageUrl,
  cloudinary, // Export cloudinary instance for advanced usage
};
