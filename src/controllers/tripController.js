const { tripService, tripImageService } = require('../services');
const { ApiResponse, catchAsync } = require('../utils');

/**
 * Create a new trip
 * POST /api/v1/trips
 */
const createTrip = catchAsync(async (req, res) => {
    const trip = await tripService.createTrip(req.body, req.user.id);

    return ApiResponse.created(res, trip, 'Trip created successfully');
});

/**
 * Get all trips with filters
 * GET /api/v1/trips
 */
const getTrips = catchAsync(async (req, res) => {
    const {
        page,
        limit,
        q,
        destination,
        startDate,
        endDate,
        priceMin,
        priceMax,
        durationMin,
        durationMax,
        tags,
        sort,
    } = req.query;

    const result = await tripService.getTrips({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        q,
        destination,
        startDate,
        endDate,
        priceMin,
        priceMax,
        durationMin,
        durationMax,
        tags,
        sort,
        includeUnpublished: false,
    });

    return ApiResponse.paginated(res, result.trips, result.pagination, 'Trips retrieved successfully');
});

/**
 * Get trips for admin (includes unpublished)
 * GET /api/v1/admin/trips
 */
const getAdminTrips = catchAsync(async (req, res) => {
    const {
        page,
        limit,
        q,
        destination,
        status,
        sort,
    } = req.query;

    const result = await tripService.getTrips({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        q,
        destination,
        status,
        sort,
        includeUnpublished: true,
    });

    return ApiResponse.paginated(res, result.trips, result.pagination, 'Trips retrieved successfully');
});

/**
 * Get trip by ID or slug
 * GET /api/v1/trips/:tripId
 */
const getTrip = catchAsync(async (req, res) => {
    const trip = await tripService.getTripByIdOrSlug(req.params.tripId);

    return ApiResponse.success(res, trip, 'Trip retrieved successfully');
});

/**
 * Update trip
 * PUT /api/v1/trips/:tripId
 */
const updateTrip = catchAsync(async (req, res) => {
    const trip = await tripService.updateTrip(req.params.tripId, req.body);

    return ApiResponse.success(res, trip, 'Trip updated successfully');
});

/**
 * Delete trip
 * DELETE /api/v1/trips/:tripId
 */
const deleteTrip = catchAsync(async (req, res) => {
    await tripService.deleteTrip(req.params.tripId);

    return ApiResponse.success(res, null, 'Trip deleted successfully');
});

/**
 * Publish trip
 * POST /api/v1/trips/:tripId/publish
 */
const publishTrip = catchAsync(async (req, res) => {
    const trip = await tripService.publishTrip(req.params.tripId);

    return ApiResponse.success(res, trip, 'Trip published successfully');
});

/**
 * Unpublish trip
 * POST /api/v1/trips/:tripId/unpublish
 */
const unpublishTrip = catchAsync(async (req, res) => {
    const trip = await tripService.unpublishTrip(req.params.tripId);

    return ApiResponse.success(res, trip, 'Trip unpublished successfully');
});

/**
 * Get trip availability
 * GET /api/v1/trips/:tripId/availability
 */
const getTripAvailability = catchAsync(async (req, res) => {
    const availability = await tripService.getTripAvailability(req.params.tripId);

    return ApiResponse.success(res, availability, 'Availability retrieved successfully');
});

/**
 * Get trip itinerary
 * GET /api/v1/trips/:tripId/itinerary
 */
const getTripItinerary = catchAsync(async (req, res) => {
    const itinerary = await tripService.getTripItinerary(req.params.tripId);

    return ApiResponse.success(res, itinerary, 'Itinerary retrieved successfully');
});

/**
 * Override trip availability (admin)
 * PUT /api/v1/admin/trips/:tripId/override-availability
 */
const overrideAvailability = catchAsync(async (req, res) => {
    const { seatsAvailable } = req.body;
    const result = await tripService.overrideAvailability(req.params.tripId, seatsAvailable);

    return ApiResponse.success(res, result, 'Availability updated successfully');
});

// =============== Trip Images ===============

/**
 * Add image to trip
 * POST /api/v1/trips/:tripId/images
 */
const addImage = catchAsync(async (req, res) => {
    const image = await tripImageService.addImage(req.params.tripId, req.body);

    return ApiResponse.created(res, image, 'Image added successfully');
});

/**
 * Get trip images
 * GET /api/v1/trips/:tripId/images
 */
const getTripImages = catchAsync(async (req, res) => {
    const images = await tripImageService.getTripImages(req.params.tripId);

    return ApiResponse.success(res, images, 'Images retrieved successfully');
});

/**
 * Update image
 * PUT /api/v1/trips/:tripId/images/:imageId
 */
const updateImage = catchAsync(async (req, res) => {
    const image = await tripImageService.updateImage(
        req.params.tripId,
        req.params.imageId,
        req.body
    );

    return ApiResponse.success(res, image, 'Image updated successfully');
});

/**
 * Delete image
 * DELETE /api/v1/trips/:tripId/images/:imageId
 */
const deleteImage = catchAsync(async (req, res) => {
    await tripImageService.deleteImage(req.params.tripId, req.params.imageId);

    return ApiResponse.success(res, null, 'Image deleted successfully');
});

module.exports = {
    createTrip,
    getTrips,
    getAdminTrips,
    getTrip,
    updateTrip,
    deleteTrip,
    publishTrip,
    unpublishTrip,
    getTripAvailability,
    getTripItinerary,
    overrideAvailability,
    addImage,
    getTripImages,
    updateImage,
    deleteImage,
};
