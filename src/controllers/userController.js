const { userService, authService } = require('../services');
const { ApiResponse, catchAsync } = require('../utils');

/**
 * Get current user profile
 * GET /api/v1/users/me
 */
const getMe = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.user.id);

    return ApiResponse.success(res, user, 'Profile retrieved successfully');
});

/**
 * Update current user profile
 * PUT /api/v1/users/me
 */
const updateMe = catchAsync(async (req, res) => {
    const { name, phone, profilePhoto } = req.body;

    const user = await userService.updateProfile(req.user.id, {
        name,
        phone,
        profilePhoto,
    });

    return ApiResponse.success(res, user, 'Profile updated successfully');
});

/**
 * Change current user password
 * PUT /api/v1/users/me/password
 */
const changePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(req.user.id, currentPassword, newPassword);

    return ApiResponse.success(res, null, 'Password changed successfully');
});

/**
 * Get user by ID (admin only)
 * GET /api/v1/users/:id
 */
const getUserById = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    return ApiResponse.success(res, user, 'User retrieved successfully');
});

/**
 * Update user (admin only)
 * PUT /api/v1/users/:id
 */
const updateUser = catchAsync(async (req, res) => {
    const { role, isActive } = req.body;

    const user = await userService.updateUserByAdmin(req.params.id, {
        role,
        isActive,
    });

    return ApiResponse.success(res, user, 'User updated successfully');
});

/**
 * Delete user (admin only - soft delete)
 * DELETE /api/v1/users/:id
 */
const deleteUser = catchAsync(async (req, res) => {
    await userService.deleteUser(req.params.id);

    return ApiResponse.success(res, null, 'User deleted successfully');
});

/**
 * List all users (admin only)
 * GET /api/v1/admin/users
 */
const listUsers = catchAsync(async (req, res) => {
    const { page, limit, role, isActive, search } = req.query;

    const result = await userService.getAllUsers({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        role,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        search,
    });

    return ApiResponse.paginated(res, result.users, result.pagination, 'Users retrieved successfully');
});

module.exports = {
    getMe,
    updateMe,
    changePassword,
    getUserById,
    updateUser,
    deleteUser,
    listUsers,
};
