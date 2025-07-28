/**
 * Authentication Routes
 * Defines all routes related to user authentication and authorization
 */

import express from "express";
import authController from "../controllers/authController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Public authentication routes (no authentication required)
 */

// User registration
router.post("/register", authController.register);

// User login
router.post("/login", authController.login);

/**
 * Protected authentication routes (authentication required)
 */

// Get current user profile
router.get("/profile", authenticate(), authController.getProfile);

// Validate current token
router.post("/validate", authenticate(), authController.validateToken);

// Logout (for logging purposes)
router.post("/logout", authenticate(), authController.logout);

// Change password (bonus feature)
router.put("/change-password", authenticate(), authController.changePassword);

/**
 * Admin-only routes
 */

// Get authentication statistics
router.get("/stats", authenticate(), requireAdmin(), authController.getAuthStats);

export default router;