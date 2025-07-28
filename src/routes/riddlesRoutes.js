/**
 * Riddles Routes
 * Including authentication and authorization middleware
 */
import express from 'express';
import riddlesController from '../controllers/riddlesController.js';
import { authenticate, requireUserOrAdmin, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all riddles - requires user or admin authentication
router.get("/", authenticate(), requireUserOrAdmin(), riddlesController.getAllRiddles);

// Get random riddle - public access (anyone can play)
router.get("/random", riddlesController.getRandomRiddle);

// Get riddle by ID - requires user or admin authentication
router.get("/:id", authenticate(), requireUserOrAdmin(), riddlesController.getRiddleById);

// Create a new riddle - requires user or admin authentication
router.post("/", authenticate(), requireUserOrAdmin(), riddlesController.createRiddle);

// Update a riddle - requires admin authentication only
router.put("/:id", authenticate(), requireAdmin(), riddlesController.updateRiddle);

// Delete a riddle - requires admin authentication only
router.delete("/:id", authenticate(), requireAdmin(), riddlesController.deleteRiddle);

// Load initial riddles - requires admin authentication only
router.post("/load-initial", authenticate(), requireAdmin(), riddlesController.loadInitialRiddles);

export default router;