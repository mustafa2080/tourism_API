const express = require('express');
const router = express.Router();
const { reviewController } = require('../controllers');
const { authenticate, validate } = require('../middlewares');
const {
    getReviewValidator,
    updateReviewValidator,
} = require('../validators/review.validator');

/**
 * @route   GET /api/v1/reviews/:reviewId
 * @desc    Get review by ID
 * @access  Public
 */
router.get('/:reviewId', getReviewValidator, validate, reviewController.getReview);

/**
 * @route   PUT /api/v1/reviews/:reviewId
 * @desc    Update review
 * @access  Private (owner or admin)
 */
router.put('/:reviewId', authenticate, updateReviewValidator, validate, reviewController.updateReview);

/**
 * @route   DELETE /api/v1/reviews/:reviewId
 * @desc    Delete review
 * @access  Private (owner or admin)
 */
router.delete('/:reviewId', authenticate, getReviewValidator, validate, reviewController.deleteReview);

/**
 * @route   POST /api/v1/reviews/:reviewId/flag
 * @desc    Flag review for moderation
 * @access  Private
 */
router.post('/:reviewId/flag', authenticate, getReviewValidator, validate, reviewController.flagReview);

module.exports = router;
