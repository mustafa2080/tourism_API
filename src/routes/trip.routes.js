const express = require('express');
const router = express.Router();
const { tripController, reviewController, bookingController } = require('../controllers');
const { authenticate, authorize, optionalAuth, validate } = require('../middlewares');
const {
    createTripValidator,
    updateTripValidator,
    getTripValidator,
    listTripsValidator,
    addImageValidator,
    updateImageValidator,
    deleteImageValidator,
} = require('../validators/trip.validator');
const { createReviewValidator, listReviewsValidator } = require('../validators/review.validator');
const { createBookingValidator } = require('../validators/booking.validator');

/**
 * @route   GET /api/v1/trips
 * @desc    Get all published trips with filters
 * @access  Public
 */
router.get('/', listTripsValidator, validate, tripController.getTrips);

/**
 * @route   POST /api/v1/trips
 * @desc    Create a new trip
 * @access  Admin/Operator
 */
router.post('/', authenticate, authorize('ADMIN'), createTripValidator, validate, tripController.createTrip);

/**
 * @route   GET /api/v1/trips/:tripId
 * @desc    Get trip by ID or slug
 * @access  Public
 */
router.get('/:tripId', getTripValidator, validate, tripController.getTrip);

/**
 * @route   PUT /api/v1/trips/:tripId
 * @desc    Update trip
 * @access  Admin/Operator
 */
router.put('/:tripId', authenticate, authorize('ADMIN'), updateTripValidator, validate, tripController.updateTrip);

/**
 * @route   DELETE /api/v1/trips/:tripId
 * @desc    Delete trip (soft delete)
 * @access  Admin/Operator
 */
router.delete('/:tripId', authenticate, authorize('ADMIN'), getTripValidator, validate, tripController.deleteTrip);

/**
 * @route   POST /api/v1/trips/:tripId/publish
 * @desc    Publish a trip
 * @access  Admin
 */
router.post('/:tripId/publish', authenticate, authorize('ADMIN'), getTripValidator, validate, tripController.publishTrip);

/**
 * @route   POST /api/v1/trips/:tripId/unpublish
 * @desc    Unpublish a trip
 * @access  Admin
 */
router.post('/:tripId/unpublish', authenticate, authorize('ADMIN'), getTripValidator, validate, tripController.unpublishTrip);

/**
 * @route   GET /api/v1/trips/:tripId/availability
 * @desc    Get trip availability
 * @access  Public
 */
router.get('/:tripId/availability', getTripValidator, validate, tripController.getTripAvailability);

/**
 * @route   GET /api/v1/trips/:tripId/itinerary
 * @desc    Get trip itinerary
 * @access  Public
 */
router.get('/:tripId/itinerary', getTripValidator, validate, tripController.getTripItinerary);

// =============== Trip Images ===============

/**
 * @route   GET /api/v1/trips/:tripId/images
 * @desc    Get all images for a trip
 * @access  Public
 */
router.get('/:tripId/images', getTripValidator, validate, tripController.getTripImages);

/**
 * @route   POST /api/v1/trips/:tripId/images
 * @desc    Add image to trip
 * @access  Admin
 */
router.post('/:tripId/images', authenticate, authorize('ADMIN'), addImageValidator, validate, tripController.addImage);

/**
 * @route   PUT /api/v1/trips/:tripId/images/:imageId
 * @desc    Update image
 * @access  Admin
 */
router.put('/:tripId/images/:imageId', authenticate, authorize('ADMIN'), updateImageValidator, validate, tripController.updateImage);

/**
 * @route   DELETE /api/v1/trips/:tripId/images/:imageId
 * @desc    Delete image
 * @access  Admin
 */
router.delete('/:tripId/images/:imageId', authenticate, authorize('ADMIN'), deleteImageValidator, validate, tripController.deleteImage);

// =============== Trip Reviews ===============

/**
 * @route   GET /api/v1/trips/:tripId/reviews
 * @desc    Get reviews for a trip
 * @access  Public
 */
router.get('/:tripId/reviews', getTripValidator, listReviewsValidator, validate, reviewController.getTripReviews);

/**
 * @route   POST /api/v1/trips/:tripId/reviews
 * @desc    Create a review for a trip
 * @access  Private
 */
router.post('/:tripId/reviews', authenticate, createReviewValidator, validate, reviewController.createReview);

// =============== Trip Bookings ===============

/**
 * @route   POST /api/v1/trips/:tripId/bookings
 * @desc    Create a booking for a trip
 * @access  Private
 */
router.post('/:tripId/bookings', authenticate, createBookingValidator, validate, bookingController.createBooking);

module.exports = router;
