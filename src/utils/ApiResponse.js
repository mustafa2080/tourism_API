/**
 * Standard API Response helper
 */
class ApiResponse {
    /**
     * Send success response
     */
    static success(res, data = null, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }

    /**
     * Send created response (201)
     */
    static created(res, data = null, message = 'Created successfully') {
        return this.success(res, data, message, 201);
    }

    /**
     * Send no content response (204)
     */
    static noContent(res) {
        return res.status(204).send();
    }

    /**
     * Send paginated response
     */
    static paginated(res, data, pagination, message = 'Success') {
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                totalItems: pagination.totalItems,
                totalPages: Math.ceil(pagination.totalItems / pagination.limit),
                hasNextPage: pagination.page < Math.ceil(pagination.totalItems / pagination.limit),
                hasPrevPage: pagination.page > 1,
            },
        });
    }
}

module.exports = ApiResponse;
