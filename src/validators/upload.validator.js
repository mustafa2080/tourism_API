const { body, query } = require('express-validator');

const getSignedUrlValidator = [
    body('filename')
        .trim()
        .notEmpty()
        .withMessage('Filename is required')
        .isLength({ max: 255 })
        .withMessage('Filename too long'),

    body('contentType')
        .notEmpty()
        .withMessage('Content type is required')
        .isIn(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
        .withMessage('Invalid content type'),

    body('tripId')
        .optional()
        .isUUID()
        .withMessage('Invalid trip ID'),
];

const uploadCallbackValidator = [
    body('uploadId')
        .notEmpty()
        .withMessage('Upload ID is required'),

    body('key')
        .notEmpty()
        .withMessage('Key is required'),
];

const listAuditLogsValidator = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    query('actorId')
        .optional()
        .isUUID()
        .withMessage('Invalid actor ID'),

    query('action')
        .optional()
        .trim(),

    query('targetType')
        .optional()
        .trim(),

    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date'),

    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date'),
];

module.exports = {
    getSignedUrlValidator,
    uploadCallbackValidator,
    listAuditLogsValidator,
};
