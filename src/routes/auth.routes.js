const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { validate } = require('../middlewares');
const {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
} = require('../validators');
const { body } = require('express-validator');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', registerValidator, validate, authController.register);

/**
 * @route   POST /api/v1/auth/register-admin
 * @desc    Register new admin/support user (requires admin secret)
 * @access  Public (but requires admin secret key)
 */
router.post('/register-admin',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
        body('role').isIn(['USER', 'ADMIN', 'SUPPORT']).withMessage('Role must be USER, ADMIN, or SUPPORT'),
        body('adminSecret').notEmpty().withMessage('Admin secret is required'),
        body('phone').optional().trim(),
    ],
    validate,
    authController.registerAdmin
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidator, validate, authController.login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Public (but typically called by authenticated users)
 */
router.post('/logout', authController.logout);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires valid refresh token)
 */
router.post('/refresh', authController.refresh);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', forgotPasswordValidator, validate, authController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password', resetPasswordValidator, validate, authController.resetPassword);

module.exports = router;
