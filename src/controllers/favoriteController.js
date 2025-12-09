const { favoriteService } = require('../services');
const { ApiResponse, catchAsync } = require('../utils');

/**
 * Get user's favorites
 * GET /api/v1/favorites
 */
const getFavorites = catchAsync(async (req, res) => {
    const { page, limit } = req.query;

    const result = await favoriteService.getUserFavorites(req.user.id, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
    });

    return ApiResponse.paginated(res, result.favorites, result.pagination, 'Favorites retrieved successfully');
});

/**
 * Add to favorites
 * POST /api/v1/favorites
 */
const addFavorite = catchAsync(async (req, res) => {
    const { tripId } = req.body;
    const favorite = await favoriteService.addFavorite(req.user.id, tripId);

    return ApiResponse.created(res, favorite, 'Added to favorites');
});

/**
 * Remove from favorites by ID
 * DELETE /api/v1/favorites/:favoriteId
 */
const removeFavorite = catchAsync(async (req, res) => {
    await favoriteService.removeFavoriteById(req.params.favoriteId, req.user.id);

    return ApiResponse.success(res, null, 'Removed from favorites');
});

/**
 * Remove from favorites by trip ID
 * DELETE /api/v1/favorites/trip/:tripId
 */
const removeFavoriteByTrip = catchAsync(async (req, res) => {
    await favoriteService.removeFavoriteByTripId(req.params.tripId, req.user.id);

    return ApiResponse.success(res, null, 'Removed from favorites');
});

module.exports = {
    getFavorites,
    addFavorite,
    removeFavorite,
    removeFavoriteByTrip,
};
