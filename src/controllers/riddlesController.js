/**
 * Riddles Controller
 */
import Riddle from '../models/Riddle.js';
import { catchAsync, ApiError } from '../middleware/errorHandler.js';

/**
 * Get all riddles
 */
export const getAllRiddles = catchAsync(async (req, res) => {
    const { level, limit = 50, skip = 0 } = req.query;
    const filters = {};

    if (level) filters.level = level;

    const riddles = await Riddle.findAll(filters, { limit: parseInt(limit), skip: parseInt(skip) });

    res.json({
        success: true,
        count: riddles.length,
        data: riddles,
    });
});

/**
 * Get a random riddle
 */
export const getRandomRiddle = catchAsync(async (req, res) => {
    const riddle = await Riddle.findRandom();

    res.json({
        success: true,
        data: riddle,
    });
});

/**
 * Get riddle by ID
 */
export const getRiddleById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const riddle = await Riddle.findById(id);

    if (!riddle) {
        throw new ApiError(404, "Riddle not found");
    }

    res.json({
        success: true,
        data: riddle,
    });
});

/**
 * Create a new riddle
 */
export const createRiddle = catchAsync(async (req, res) => {
    const riddle = await Riddle.create(req.body);

    res.status(201).json({
        success: true,
        message: "Riddle created successfully",
        data: riddle,
    });
});

/**
 * Update a riddle
 */
export const updateRiddle = catchAsync(async (req, res) => {
    const { id } = req.params;
    const riddle = await Riddle.updateById(id, req.body);

    res.json({
        success: true,
        message: "Riddle updated successfully",
        data: riddle,
    });
});

/**
 * Delete a riddle
 */
export const deleteRiddle = catchAsync(async (req, res) => {
    const { id } = req.params;
    await Riddle.deleteById(id);

    res.json({
        success: true,
        message: "Riddle deleted successfully",
        data: { id },
    });
});

/**
 * Load initial riddles
 */
export const loadInitialRiddles = catchAsync(async (req, res) => {
    const { riddles } = req.body;

    if (!riddles || !Array.isArray(riddles) || riddles.length === 0) {
        throw new ApiError(400, "No riddles provided or invalid format");
    }

    const result = await Riddle.loadInitial(riddles);

    res.status(201).json({
        success: true,
        message: `Successfully loaded ${result.inserted} riddles`,
        data: result,
    });
});