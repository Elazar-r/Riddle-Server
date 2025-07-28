/**
 * Authentication Controller
 * Handles HTTP requests for user authentication and authorization
 * Implements clean API design with proper error handling
 */
import { catchAsync, ApiError } from '../middleware/errorHandler.js';
import authService from '../services/authService.js';

/**
 * Register a new user
 *
 * route POST /auth/register
 * access Public
 * Object req.body - Request body
 * string req.body.username - Username (3+ characters)
 * string req.body.password - Password (6+ characters)
 * string [req.body.adminCode] - Optional admin secret code
 */
export const register = catchAsync(async (req, res) => {
    const { username, password, adminCode } = req.body;

    // Register user through auth service
    const result = await authService.registerUser(username, password, adminCode);

    // Log successful registration (without sensitive data)
    if (process.env.NODE_ENV !== "test")
        console.log(`New user registered: ${username} with role: ${result.user.role}`);

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
    });
});

/**
 * Login user with username and password
 *
 * route POST /auth/login
 * access Public
 * Object req.body - Request body
 * string req.body.username - Username
 * string req.body.password - Password
 */
export const login = catchAsync(async (req, res) => {
    const { username, password } = req.body;

    // Login user through auth service
    const result = await authService.loginUser(username, password);

    // Log successful login (without sensitive data)
    if (process.env.NODE_ENV !== "test")
        console.log(`User logged in: ${username} with role: ${result.user.role}`);

    res.json({
        success: true,
        message: "Login successful",
        data: result,
    });
});

/**
 * Get current user profile
 *
 * route GET /auth/profile
 * access Private (requires authentication)
 */
export const getProfile = catchAsync(async (req, res) => {
    // User data is already available from auth middleware
    const { id, username, role } = req.user;

    res.json({
        success: true,
        message: "Profile retrieved successfully",
        data: {
            id,
            username,
            role,
            tokenExpiry: req.tokenData?.exp ? new Date(req.tokenData.exp * 1000) : null,
        },
    });
});

/**
 * Validate token endpoint (useful for client-side token validation)
 *
 * route POST /auth/validate
 * access Private (requires authentication)
 */
export const validateToken = catchAsync(async (req, res) => {
    // If we reach here, token is valid (middleware already validated it)
    const { id, username, role } = req.user;

    res.json({
        success: true,
        message: "Token is valid",
        data: {
            valid: true,
            user: { id, username, role },
            expiresAt: req.tokenData?.exp ? new Date(req.tokenData.exp * 1000) : null,
        },
    });
});

/**
 * Logout endpoint (client-side token removal)
 * Since we're using stateless JWT, actual logout is handled client-side
 * This endpoint can be used for logging purposes
 *
 * route POST /auth/logout
 * access Private (requires authentication)
 */
export const logout = catchAsync(async (req, res) => {
    const { username } = req.user;

    // Log logout event
    if (process.env.NODE_ENV !== "test") console.log(`User logged out: ${username}`);

    res.json({
        success: true,
        message: "Logout successful. Please remove token from client storage.",
    });
});

/**
 * Change password endpoint (bonus feature)
 *
 * route PUT /auth/change-password
 * access Private (requires authentication)
 * param {Object} req.body - Request body
 * string req.body.currentPassword - Current password
 * string req.body.newPassword - New password (6+ characters)
 */
export const changePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword)
        throw new ApiError(400, "Current password and new password are required");

    if (newPassword.length < 6) throw new ApiError(400, "New password must be at least 6 characters long");

    // This would require implementing changePassword in authService
    // For now, we'll just return a placeholder response
    throw new ApiError(501, "Password change feature not implemented yet");
});

/**
 * Get authentication statistics (admin only)
 *
 * route GET /auth/stats
 * access Private (admin only)
 */
export const getAuthStats = catchAsync(async (req, res) => {
    // This would require implementing stats collection
    // For now, return basic info
    res.json({
        success: true,
        message: "Authentication statistics",
        data: {
            feature: "Admin authentication statistics",
            status: "Not implemented yet",
            suggestion: "Could include user count by role, recent registrations, etc.",
        },
    });
});