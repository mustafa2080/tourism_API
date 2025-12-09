const prisma = require('../config/database');
const { ApiError } = require('../utils');

/**
 * Create a review
 */
const createReview = async (tripId, userId, reviewData) => {
    const { rating, title, comment } = reviewData;

    // Check if trip exists
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
    });

    if (!trip) {
        throw ApiError.notFound('Trip not found');
    }

    // Check if user already reviewed this trip
    const existingReview = await prisma.review.findUnique({
        where: {
            tripId_userId: { tripId, userId },
        },
    });

    if (existingReview) {
        throw ApiError.conflict('You have already reviewed this trip');
    }

    const review = await prisma.review.create({
        data: {
            tripId,
            userId,
            rating,
            title,
            comment,
            status: 'PUBLISHED',
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                },
            },
        },
    });

    return review;
};

/**
 * Get reviews for a trip
 */
const getTripReviews = async (tripId, options = {}) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    // Check if trip exists
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
    });

    if (!trip) {
        throw ApiError.notFound('Trip not found');
    }

    const where = {
        tripId,
        status: 'PUBLISHED',
    };

    const [reviews, totalItems] = await Promise.all([
        prisma.review.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.review.count({ where }),
    ]);

    return {
        reviews,
        pagination: {
            page,
            limit,
            totalItems,
        },
    };
};

/**
 * Get review by ID
 */
const getReviewById = async (reviewId) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                },
            },
            trip: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                },
            },
        },
    });

    if (!review) {
        throw ApiError.notFound('Review not found');
    }

    return review;
};

/**
 * Update review
 */
const updateReview = async (reviewId, userId, updateData, isAdmin = false) => {
    const { rating, title, comment } = updateData;

    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!review) {
        throw ApiError.notFound('Review not found');
    }

    // Check ownership unless admin
    if (!isAdmin && review.userId !== userId) {
        throw ApiError.forbidden('You can only edit your own reviews');
    }

    const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
            ...(rating !== undefined && { rating }),
            ...(title !== undefined && { title }),
            ...(comment !== undefined && { comment }),
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                },
            },
        },
    });

    return updatedReview;
};

/**
 * Delete review
 */
const deleteReview = async (reviewId, userId, isAdmin = false) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!review) {
        throw ApiError.notFound('Review not found');
    }

    // Check ownership unless admin
    if (!isAdmin && review.userId !== userId) {
        throw ApiError.forbidden('You can only delete your own reviews');
    }

    await prisma.review.delete({
        where: { id: reviewId },
    });
};

/**
 * Flag review for moderation
 */
const flagReview = async (reviewId, userId) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!review) {
        throw ApiError.notFound('Review not found');
    }

    if (review.status === 'FLAGGED') {
        throw ApiError.badRequest('Review is already flagged');
    }

    await prisma.review.update({
        where: { id: reviewId },
        data: { status: 'FLAGGED' },
    });
};

/**
 * Get all reviews for admin (with filters)
 */
const getAdminReviews = async (options = {}) => {
    const { page = 1, limit = 20, status, tripId } = options;
    const skip = (page - 1) * limit;

    const where = {
        ...(status && { status }),
        ...(tripId && { tripId }),
    };

    const [reviews, totalItems] = await Promise.all([
        prisma.review.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                trip: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.review.count({ where }),
    ]);

    return {
        reviews,
        pagination: {
            page,
            limit,
            totalItems,
        },
    };
};

/**
 * Moderate review (admin)
 */
const moderateReview = async (reviewId, status) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!review) {
        throw ApiError.notFound('Review not found');
    }

    const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: { status },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return updatedReview;
};

module.exports = {
    createReview,
    getTripReviews,
    getReviewById,
    updateReview,
    deleteReview,
    flagReview,
    getAdminReviews,
    moderateReview,
};
