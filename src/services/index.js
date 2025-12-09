const authService = require('./auth.service');
const userService = require('./user.service');
const tripService = require('./trip.service');
const tripImageService = require('./tripImage.service');
const reviewService = require('./review.service');
const bookingService = require('./booking.service');
const favoriteService = require('./favorite.service');
const auditService = require('./audit.service');
const emailService = require('./email.service');
const uploadService = require('./upload.service');

module.exports = {
    authService,
    userService,
    tripService,
    tripImageService,
    reviewService,
    bookingService,
    favoriteService,
    auditService,
    emailService,
    uploadService,
};
