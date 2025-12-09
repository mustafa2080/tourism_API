const authValidator = require('./auth.validator');
const userValidator = require('./user.validator');
const tripValidator = require('./trip.validator');
const reviewValidator = require('./review.validator');
const bookingValidator = require('./booking.validator');
const favoriteValidator = require('./favorite.validator');
const uploadValidator = require('./upload.validator');

module.exports = {
    ...authValidator,
    ...userValidator,
    ...tripValidator,
    ...reviewValidator,
    ...bookingValidator,
    ...favoriteValidator,
    ...uploadValidator,
};
