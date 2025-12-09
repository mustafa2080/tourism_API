const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { authenticate, authorize, validate } = require('../middlewares');
const {
    updateProfileValidator,
    changePasswordValidator,
    getUserValidator,
    updateUserValidator,
} = require('../validators');

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, userController.getMe);

/**
 * @route   PUT /api/v1/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', authenticate, updateProfileValidator, validate, userController.updateMe);

/**
 * @route   PUT /api/v1/users/me/password
 * @desc    Change current user password
 * @access  Private
 */
router.put('/me/password', authenticate, changePasswordValidator, validate, userController.changePassword);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Admin only
 */
router.get('/:id', authenticate, authorize('ADMIN'), getUserValidator, validate, userController.getUserById);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user role/status
 * @access  Admin only
 */
router.put('/:id', authenticate, authorize('ADMIN'), updateUserValidator, validate, userController.updateUser);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user (soft delete)
 * @access  Admin only
 */
router.delete('/:id', authenticate, authorize('ADMIN'), getUserValidator, validate, userController.deleteUser);

module.exports = router;
