const { reviewService } = require('../services');
const { ApiResponse, catchAsync } = require('../utils');

/**
 * Create a review
 * POST /api/v1/trips/:tripId/reviews
 */
const createReview = catchAsync(async (req, res) => {
    const { tripId } = req.params;
    const review = await reviewService.createReview(tripId, req.user.id, req.body);

    return ApiResponse.created(res, review, 'Review created successfully');
});

/**
 * Get reviews for a trip
 * GET /api/v1/trips/:tripId/reviews
 */
const getTripReviews = catchAsync(async (req, res) => {
    const { tripId } = req.params;
    const { page, limit } = req.query;

    const result = await reviewService.getTripReviews(tripId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
    });

    return ApiResponse.paginated(res, result.reviews, result.pagination, 'Reviews retrieved successfully');
});

/**
 * Get review by ID
 * GET /api/v1/reviews/:reviewId
 */
const getReview = catchAsync(async (req, res) => {
    const review = await reviewService.getReviewById(req.params.reviewId);

    return ApiResponse.success(res, review, 'Review retrieved successfully');
});

/**
 * Update review
 * PUT /api/v1/reviews/:reviewId
 */
const updateReview = catchAsync(async (req, res) => {
    const isAdmin = req.user.role === 'ADMIN';
    const review = await reviewService.updateReview(
        req.params.reviewId,
        req.user.id,
        req.body,
        isAdmin
    );

    return ApiResponse.success(res, review, 'Review updated successfully');
});

/**
 * Delete review
 * DELETE /api/v1/reviews/:reviewId
 */
const deleteReview = catchAsync(async (req, res) => {
    const isAdmin = req.user.role === 'ADMIN';
    await reviewService.deleteReview(req.params.reviewId, req.user.id, isAdmin);

    return ApiResponse.success(res, null, 'Review deleted successfully');
});

/**
 * Flag review
 * POST /api/v1/reviews/:reviewId/flag
 */
const flagReview = catchAsync(async (req, res) => {
    await reviewService.flagReview(req.params.reviewId, req.user.id);

    return ApiResponse.success(res, null, 'Review flagged for moderation');
});

/**
 * Get admin reviews
 * GET /api/v1/admin/reviews
 */
const getAdminReviews = catchAsync(async (req, res) => {
    const { page, limit, status, tripId } = req.query;

    const result = await reviewService.getAdminReviews({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status,
        tripId,
    });

    return ApiResponse.paginated(res, result.reviews, result.pagination, 'Reviews retrieved successfully');
});

/**
 * Moderate review
 * PUT /api/v1/admin/reviews/:reviewId/moderate
 */
const moderateReview = catchAsync(async (req, res) => {
    const { status } = req.body;
    const review = await reviewService.moderateReview(req.params.reviewId, status);

    return ApiResponse.success(res, review, 'Review moderated successfully');
});

module.exports = {
    createReview,
    getTripReviews,
    getReview,
    updateReview,
    deleteReview,
    flagReview,
    getAdminReviews,
    moderateReview,
};
