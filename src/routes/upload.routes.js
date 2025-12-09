const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticate, authorize, validate } = require('../middlewares');
const { getSignedUrlValidator, uploadCallbackValidator } = require('../validators/upload.validator');

/**
 * @route   POST /api/v1/uploads/url
 * @desc    Get signed upload URL
 * @access  Admin only
 */
router.post('/url', authenticate, authorize('ADMIN'), getSignedUrlValidator, validate, uploadController.getSignedUrl);

/**
 * @route   POST /api/v1/uploads/callback
 * @desc    Upload callback after successful upload
 * @access  Internal (could add API key validation)
 */
router.post('/callback', uploadCallbackValidator, validate, uploadController.uploadCallback);

module.exports = router;
