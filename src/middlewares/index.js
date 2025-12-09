const errorHandler = require('./errorHandler');
const notFoundHandler = require('./notFoundHandler');
const validate = require('./validate');
const { authenticate, optionalAuth, authorize } = require('./auth');

module.exports = {
    errorHandler,
    notFoundHandler,
    validate,
    authenticate,
    optionalAuth,
    authorize,
};
