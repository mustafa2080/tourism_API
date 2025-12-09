const crypto = require('crypto');
const config = require('../config');
const { ApiError } = require('../utils');

/**
 * Upload Service
 * Handles signed URL generation for direct-to-storage uploads
 * In production, integrate with AWS S3, Cloudinary, or similar
 */

/**
 * Allowed file types and their constraints
 */
const ALLOWED_TYPES = {
    'image/jpeg': { ext: 'jpg', maxSize: 10 * 1024 * 1024 }, // 10MB
    'image/png': { ext: 'png', maxSize: 10 * 1024 * 1024 },
    'image/webp': { ext: 'webp', maxSize: 10 * 1024 * 1024 },
    'image/gif': { ext: 'gif', maxSize: 5 * 1024 * 1024 }, // 5MB
};

/**
 * Generate a unique filename
 */
const generateFilename = (originalFilename, contentType) => {
    const ext = ALLOWED_TYPES[contentType]?.ext || 'jpg';
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const sanitizedName = originalFilename
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace special chars
        .substring(0, 50); // Limit length

    return `${sanitizedName}-${timestamp}-${random}.${ext}`;
};

/**
 * Generate signed upload URL
 * In production, this would generate a pre-signed URL for S3 or similar
 */
const generateSignedUploadUrl = async (options) => {
    const { filename, contentType, tripId, userId } = options;

    // Validate content type
    if (!ALLOWED_TYPES[contentType]) {
        throw ApiError.badRequest(`Invalid file type. Allowed: ${Object.keys(ALLOWED_TYPES).join(', ')}`);
    }

    const maxSize = ALLOWED_TYPES[contentType].maxSize;
    const generatedFilename = generateFilename(filename, contentType);
    const key = tripId
        ? `trips/${tripId}/${generatedFilename}`
        : `uploads/${userId}/${generatedFilename}`;

    // In production with AWS S3:
    // const s3 = new AWS.S3();
    // const signedUrl = await s3.getSignedUrlPromise('putObject', {
    //   Bucket: config.aws.s3Bucket,
    //   Key: key,
    //   ContentType: contentType,
    //   Expires: 300, // 5 minutes
    // });

    // For development, return a mock URL
    const uploadId = crypto.randomBytes(16).toString('hex');
    const mockSignedUrl = `http://localhost:${config.port}/api/v1/uploads/mock/${uploadId}`;

    // The final URL where the file will be accessible after upload
    const fileUrl = config.nodeEnv === 'production'
        ? `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`
        : `http://localhost:${config.port}/uploads/${key}`;

    return {
        uploadUrl: mockSignedUrl,
        fileUrl,
        key,
        uploadId,
        expiresIn: 300, // seconds
        maxSize,
        contentType,
    };
};

/**
 * Confirm upload callback
 * Called after successful upload to storage
 */
const confirmUpload = async (uploadId, key) => {
    // In production, verify the file exists in storage
    // and create any necessary database records

    // For now, just return success
    return {
        success: true,
        key,
        uploadId,
    };
};

/**
 * Delete file from storage
 */
const deleteFile = async (key) => {
    // In production with AWS S3:
    // const s3 = new AWS.S3();
    // await s3.deleteObject({
    //   Bucket: config.aws.s3Bucket,
    //   Key: key,
    // }).promise();

    console.log(`Would delete file: ${key}`);
    return { success: true };
};

/**
 * Generate a thumbnail URL (for image processing services)
 */
const getThumbnailUrl = (originalUrl, width = 300, height = 200) => {
    // In production with Cloudinary or similar:
    // return originalUrl.replace('/upload/', `/upload/w_${width},h_${height},c_fill/`);

    // For now, return original
    return originalUrl;
};

module.exports = {
    ALLOWED_TYPES,
    generateFilename,
    generateSignedUploadUrl,
    confirmUpload,
    deleteFile,
    getThumbnailUrl,
};
