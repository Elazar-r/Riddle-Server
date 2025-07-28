/**
 * Authentication Middleware
 * Handles user authentication and authorization for protected routes
 */
import { ApiError } from './errorHandler.js';
import { verifyToken, getUserById } from '../services/authService.js';

/**
 * Extract token from request headers or query parameters
 *
 * Object req - Express request object
 * return string|null - Extracted token or null if not found
 */
function extractToken(req) {
    // Check Authorization header (Bearer token format)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.split(" ")[1];
    }

    // Check query param (for convenience in testing, not recommended for production)
    if (req.query && req.query.token) {
        return req.query.token;
    }

    // Check custom header
    if (req.headers["x-auth-token"]) {
        return req.headers["x-auth-token"];
    }

    return null;
}

/**
 * Authentication middleware factory
 * Creates middleware that optionally or mandatorily authenticates users
 *
 * Object options - Authentication options
 * boolean [options.required=true] - Whether authentication is required
 * boolean [options.allowGuest=false] - Whether to allow guest access
 * return Function - Express middleware function
 */
function authenticate(options = {}) {
    const { required = true, allowGuest = false } = options;

    return async (req, res, next) => {
        try {
            // Extract token from request
            const token = extractToken(req);

            // Handle case when no token is provided
            if (!token) {
                if (required) {
                    return next(new ApiError(401, "Authentication token is required"));
                } else {
                    // Set guest user for optional authentication
                    req.user = { role: "guest" };
                    return next();
                }
            }

            // Verify and decode token
            let decoded;
            try {
                decoded = verifyToken(token);
            } catch (error) {
                return next(error); // This will be an ApiError from verifyToken
            }

            // Validate that user still exists and has same role
            const user = await getUserById(decoded.id);
            if (!user) {
                return next(new ApiError(401, "User not found or has been deleted"));
            }

            // Check if user role has changed since token was issued
            if (user.role !== decoded.role) {
                return next(new ApiError(401, "User role has changed. Please login again"));
            }

            // Add user information to request object
            req.user = user;
            req.tokenData = decoded; // Include original token data if needed

            next();
        } catch (error) {
            if (error instanceof ApiError) {
                return next(error);
            }
            next(new ApiError(500, `Authentication failed: ${error.message}`));
        }
    };
}

/**
 * Authorization middleware factory
 * Creates middleware that checks if authenticated user has required role(s)
 *
 * string allowedRoles - Roles that are allowed to access the resource
 * return Function - Express middleware function
 */
function authorize(...allowedRoles) {
    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.user) {
            return next(new ApiError(401, "Authentication required for authorization"));
        }

        // If no roles specified, allow any authenticated user
        if (allowedRoles.length === 0) {
            return next();
        }

        // Check if user's role is in the allowed roles
        if (allowedRoles.includes(req.user.role)) {
            return next();
        }

        // User doesn't have required role
        const message = `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${req.user.role}`;
        next(new ApiError(403, message));
    };
}

/**
 * Middleware that requires user or admin role
 *
 * return Function - Express middleware function
 */
function requireUserOrAdmin() {
    return authorize("user", "admin");
}

/**
 * Middleware that requires admin role only
 *
 * return Function - Express middleware function
 */
function requireAdmin() {
    return authorize("admin");
}

/**
 * Middleware that allows optional authentication
 * Sets req.user to guest if no token provided
 *
 * return Function - Express middleware function
 */
function optionalAuth() {
    return authenticate({ required: false });
}

/**
 * Combined authentication and authorization middleware
 * Authenticates user and checks role in one step
 *
 * string allowedRoles - Roles that are allowed
 * return Function - Express middleware function
 */
function authAndAuthorize(...allowedRoles) {
    return [authenticate({ required: true }), authorize(...allowedRoles)];
}

export default {
    authenticate,
    authorize,
    requireUserOrAdmin,
    requireAdmin,
    optionalAuth,
    authAndAuthorize,
    extractToken,
};