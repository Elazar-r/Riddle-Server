/**
 * Players Controller
 */
import Player from '../models/Player.js';
import { catchAsync, ApiError } from '../middleware/errorHandler.js';

/**
 * Create a new player
 */
export const createPlayer = catchAsync(async (req, res) => {
    const { username } = req.body;

    if (!username) throw new ApiError(400, "Username is required");

    // Check if player already exists
    const existingPlayer = await Player.findByUsername(username);

    if (existingPlayer) {
        return res.json({
            success: true,
            message: "Player already exists",
            data: existingPlayer,
        });
    }

    // Create new player
    const player = await Player.create(username);

    res.status(201).json({
        success: true,
        message: "Player created successfully",
        data: player,
    });
});

/**
 * Get player by username
 * Optional authentication provides enhanced data based on user role
 */
export const getPlayerByUsername = catchAsync(async (req, res) => {
    const { username } = req.params;
    const user = req.user; // Optional - may be undefined if no token provided

    // Without authentication or guest user: return 401
    if (!user || user.role === 'guest') {
        return res.status(401).json({
            success: false,
            message: "Authentication required to view player information"
        });
    }

    const playerStats = await Player.getPlayerStats(username);

    // Basic public information for regular users
    let responseData = {
        username: playerStats.username,
        created_at: playerStats.created_at,
        riddles_solved: playerStats.riddles_solved
    };

    // Enhanced data for admins or when viewing own profile
    if (user.role === 'admin' || user.username === username) {
        responseData = {
            ...responseData,
            best_time: playerStats.best_time,
            total_time: playerStats.total_time,
            average_time: playerStats.average_time,
            detailed_history: playerStats.detailed_history
        };
    }

    res.json({
        success: true,
        data: responseData,
    });
});

/**
 * Submit a score
 */
export const submitScore = catchAsync(async (req, res) => {
    const { username, riddleId, timeToSolve } = req.body;

    if (!username || !riddleId || !timeToSolve)
        throw new ApiError(400, "Missing required fields: username, riddleId, timeToSolve");

    // Find or create player
    let player = await Player.findByUsername(username);

    if (!player) player = await Player.create(username);

    // Submit score
    await Player.submitScore(player.id, riddleId, timeToSolve);

    res.json({
        success: true,
        message: "Score submitted successfully",
    });
});

/**
 * Get leaderboard
 */
export const getLeaderboard = catchAsync(async (req, res) => {
    const { limit = 10 } = req.query;
    const leaderboard = await Player.getLeaderboard(parseInt(limit));

    res.json({
        success: true,
        data: leaderboard,
    });
});

/**
 * Get all players (admin only)
 */
export const getAllPlayers = catchAsync(async (req, res) => {
    const players = await Player.findAll();

    res.json({
        success: true,
        data: players,
    });
});