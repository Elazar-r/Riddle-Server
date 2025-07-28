/**
 * Players Routes
 * Including authentication middleware where appropriate
 */
import express from 'express';
import playersController from '../controllers/playersController.js';
import { optionalAuth, authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all players - admin only
router.get("/", authenticate(), authorize("admin"), playersController.getAllPlayers);

// Get leaderboard - public access
router.get("/leaderboard", playersController.getLeaderboard);

// Create a new player - public access
router.post("/", playersController.createPlayer);

// Get player by username - optional authentication (better experience for authenticated users)
router.get("/:username", optionalAuth(), playersController.getPlayerByUsername);

// Submit a score - public access (anyone can play)
router.post("/submit-score", playersController.submitScore);

export default router;