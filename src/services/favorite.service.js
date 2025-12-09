const prisma = require('../config/database');
const { ApiError } = require('../utils');

/**
 * Add trip to favorites
 */
const addFavorite = async (userId, tripId) => {
    // Check if trip exists
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
    });

    if (!trip) {
        throw ApiError.notFound('Trip not found');
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
        where: {
            userId_tripId: { userId, tripId },
        },
    });

    if (existingFavorite) {
        throw ApiError.conflict('Trip is already in favorites');
    }

    const favorite = await prisma.favorite.create({
        data: {
            userId,
            tripId,
        },
        include: {
            trip: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    price: true,
                    currency: true,
                    images: {
                        take: 1,
                        orderBy: { order: 'asc' },
                    },
                },
            },
        },
    });

    return favorite;
};

/**
 * Get user's favorites
 */
const getUserFavorites = async (userId, options = {}) => {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where = { userId };

    const [favorites, totalItems] = await Promise.all([
        prisma.favorite.findMany({
            where,
            include: {
                trip: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        description: true,
                        price: true,
                        currency: true,
                        durationDays: true,
                        destinations: true,
                        status: true,
                        images: {
                            take: 1,
                            orderBy: { order: 'asc' },
                        },
                        _count: {
                            select: { reviews: true },
                        },
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.favorite.count({ where }),
    ]);

    // Calculate average rating for each trip
    const favoritesWithRating = await Promise.all(
        favorites.map(async (fav) => {
            const avgRating = await prisma.review.aggregate({
                where: { tripId: fav.tripId, status: 'PUBLISHED' },
                _avg: { rating: true },
            });

            return {
                ...fav,
                trip: {
                    ...fav.trip,
                    averageRating: avgRating._avg.rating || 0,
                },
            };
        })
    );

    return {
        favorites: favoritesWithRating,
        pagination: {
            page,
            limit,
            totalItems,
        },
    };
};

/**
 * Remove favorite by ID
 */
const removeFavoriteById = async (favoriteId, userId) => {
    const favorite = await prisma.favorite.findUnique({
        where: { id: favoriteId },
    });

    if (!favorite) {
        throw ApiError.notFound('Favorite not found');
    }

    if (favorite.userId !== userId) {
        throw ApiError.forbidden('You can only remove your own favorites');
    }

    await prisma.favorite.delete({
        where: { id: favoriteId },
    });
};

/**
 * Remove favorite by trip ID
 */
const removeFavoriteByTripId = async (tripId, userId) => {
    const favorite = await prisma.favorite.findUnique({
        where: {
            userId_tripId: { userId, tripId },
        },
    });

    if (!favorite) {
        throw ApiError.notFound('Favorite not found');
    }

    await prisma.favorite.delete({
        where: { id: favorite.id },
    });
};

/**
 * Check if trip is favorited by user
 */
const isFavorited = async (tripId, userId) => {
    const favorite = await prisma.favorite.findUnique({
        where: {
            userId_tripId: { userId, tripId },
        },
    });

    return !!favorite;
};

module.exports = {
    addFavorite,
    getUserFavorites,
    removeFavoriteById,
    removeFavoriteByTripId,
    isFavorited,
};
