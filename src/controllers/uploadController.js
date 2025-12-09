const { uploadService } = require('../services');
const { ApiResponse, catchAsync } = require('../utils');

/**
 * Generate signed upload URL
 * POST /api/v1/uploads/url
 */
const getSignedUrl = catchAsync(async (req, res) => {
    const { filename, contentType, tripId } = req.body;

    const result = await uploadService.generateSignedUploadUrl({
        filename,
        contentType,
        tripId,
        userId: req.user.id,
    });

    return ApiResponse.success(res, result, 'Upload URL generated');
});

/**
 * Upload callback (called after successful upload)
 * POST /api/v1/uploads/callback
 */
const uploadCallback = catchAsync(async (req, res) => {
    const { uploadId, key } = req.body;

    const result = await uploadService.confirmUpload(uploadId, key);

    return ApiResponse.success(res, result, 'Upload confirmed');
});

module.exports = {
    getSignedUrl,
    uploadCallback,
};
