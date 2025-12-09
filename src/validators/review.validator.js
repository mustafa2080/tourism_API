const { body, param, query } = require('express-validator');

const createReviewValidator = [
    param('tripId')
        .isUUID()
        .withMessage('Invalid trip ID'),

    body('rating')
        .notEmpty()
        .withMessage('Rating is required')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),

    body('title')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Title must be less than 200 characters'),

    body('comment')
        .trim()
        .notEmpty()
        .withMessage('Comment is required')
        .isLength({ min: 10, max: 2000 })
        .withMessage('Comment must be between 10 and 2000 characters'),
];

const updateReviewValidator = [
    param('reviewId')
        .isUUID()
        .withMessage('Invalid review ID'),

    body('rating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),

    body('title')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Title must be less than 200 characters'),

    body('comment')
        .optional()
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Comment must be between 10 and 2000 characters'),
];

const getReviewValidator = [
    param('reviewId')
        .isUUID()
        .withMessage('Invalid review ID'),
];

const listReviewsValidator = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
];

const moderateReviewValidator = [
    param('reviewId')
        .isUUID()
        .withMessage('Invalid review ID'),

    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['PUBLISHED', 'HIDDEN', 'FLAGGED'])
        .withMessage('Invalid status'),
];

module.exports = {
    createReviewValidator,
    updateReviewValidator,
    getReviewValidator,
    listReviewsValidator,
    moderateReviewValidator,
};
