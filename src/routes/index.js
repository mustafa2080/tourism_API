const express = require('express');
const router = express.Router();

// Import route modules
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const tripRoutes = require('./trip.routes');
const reviewRoutes = require('./review.routes');
const bookingRoutes = require('./booking.routes');
const favoriteRoutes = require('./favorite.routes');
const uploadRoutes = require('./upload.routes');
const notificationRoutes = require('./notification.routes');
const adminRoutes = require('./admin.routes');

// Mount routes
router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/trips', tripRoutes);
router.use('/reviews', reviewRoutes);
router.use('/bookings', bookingRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/uploads', uploadRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

// Search route (uses trips service)
const { tripService } = require('../services');
const { ApiResponse, catchAsync } = require('../utils');
const { validate } = require('../middlewares');
const { listTripsValidator } = require('../validators/trip.validator');

/**
 * @route   GET /api/v1/search
 * @desc    General search endpoint
 * @access  Public
 */
router.get('/search', listTripsValidator, validate, catchAsync(async (req, res) => {
    const result = await tripService.getTrips({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        q: req.query.q,
        destination: req.query.destination,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        priceMin: req.query.priceMin,
        priceMax: req.query.priceMax,
        durationMin: req.query.durationMin,
        durationMax: req.query.durationMax,
        tags: req.query.tags,
        sort: req.query.sort,
        includeUnpublished: false,
    });

    return ApiResponse.paginated(res, result.trips, result.pagination, 'Search results');
}));

module.exports = router;
