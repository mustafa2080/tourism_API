const express = require('express');
const router = express.Router();
const { favoriteController } = require('../controllers');
const { authenticate, validate } = require('../middlewares');
const {
    addFavoriteValidator,
    removeFavoriteValidator,
    removeFavoriteByTripValidator,
    listFavoritesValidator,
} = require('../validators/favorite.validator');

/**
 * @route   GET /api/v1/favorites
 * @desc    Get user's favorites
 * @access  Private
 */
router.get('/', authenticate, listFavoritesValidator, validate, favoriteController.getFavorites);

/**
 * @route   POST /api/v1/favorites
 * @desc    Add to favorites
 * @access  Private
 */
router.post('/', authenticate, addFavoriteValidator, validate, favoriteController.addFavorite);

/**
 * @route   DELETE /api/v1/favorites/:favoriteId
 * @desc    Remove from favorites by ID
 * @access  Private
 */
router.delete('/:favoriteId', authenticate, removeFavoriteValidator, validate, favoriteController.removeFavorite);

/**
 * @route   DELETE /api/v1/favorites/trip/:tripId
 * @desc    Remove from favorites by trip ID
 * @access  Private
 */
router.delete('/trip/:tripId', authenticate, removeFavoriteByTripValidator, validate, favoriteController.removeFavoriteByTrip);

module.exports = router;
