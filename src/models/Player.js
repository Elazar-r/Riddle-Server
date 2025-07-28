/**
 * Player Model
 * Supabase-based model for players
 */
import { supabase } from '../db/supabase.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * class Player
 *
 * Object data - Player data
 * number data.id - Unique identifier for the player
 * string data.username - Player's username
 * Date data.created_at - Timestamp when the player was created
 * number [data.best_time=0] - Player's best time in milliseconds
 * string [data.role='user'] - Player's role (guest, user, admin)
 */
class Player {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.created_at = data.created_at;
        this.best_time = data.best_time || 0;
        this.role = data.role || "user";
    }

    // Static Methods for Database Operations

    /**
     * Create a new player
     *
     * string username - Player's username
     * retur Promise - Newly created Player instance
     * throw ApiError - If player creation fails
     */
    static async create(username) {
        try {
            const { data, error } = await supabase.from("players").insert([{ username }]).select().single();

            if (error) {
                if (error.code === "23505") {
                    // Unique constraint violation
                    throw new ApiError(409, "Username already exists");
                }
                throw error;
            }

            return new Player(data);
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, `Failed to create player: ${error.message}`);
        }
    }

    /**
     * Find player by username
     * string username - Player's username
     * retur Promise - Player instance or null if not found
     * throw ApiError - If player lookup fails
     */
    static async findByUsername(username) {
        try {
            const { data, error } = await supabase.from("players").select("*").eq("username", username).single();

            if (error) {
                if (error.code === "PGRST116") return null; // Record not found

                throw error;
            }

            return data ? new Player(data) : null;
        } catch (error) {
            throw new ApiError(500, `Failed to find player: ${error.message}`);
        }
    }

    /**
     * Get all players
     *
     * number [limit=50] - Maximum number of players to return
     * number [offset=0] - Offset for pagination
     * return Promise - Array of Player instances
     * throw ApiError - If player retrieval fails
     */
    static async findAll(limit = 50, offset = 0) {
        try {
            const { data, error } = await supabase
                .from("players")
                .select("*")
                .order("best_time", { ascending: true, nullsFirst: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            return data.map((row) => new Player(row));
        } catch (error) {
            throw new ApiError(500, `Failed to get players: ${error.message}`);
        }
    }

    /**
     * Get player by ID
     * number id - Player's ID
     * retur Promise - Player instance or null if not found
     * throw ApiError - If player lookup fails
     */
    static async findById(id) {
        try {
            const { data, error } = await supabase.from("players").select("*").eq("id", id).single();

            if (error) {
                if (error.code === "PGRST116") throw new ApiError(404, "Player not found"); // Record not found

                throw error;
            }

            return new Player(data);
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, `Failed to find player: ${error.message}`);
        }
    }

    /**
     * Submit a score for a player and riddle
     *
     * number playerId - Player's ID
     * number riddleId - Riddle's ID
     * number timeToSolve - Time taken to solve the riddle in milliseconds
     * return Promise - Result of the score submission
     * throw ApiError || superbaseError - If score submission fails
     */
    static async submitScore(playerId, riddleId, timeToSolve) {
        try {
            // Insert the score
            const { error: scoreError } = await supabase
                .from("player_scores")
                .insert([{ player_id: playerId, riddle_id: riddleId, time_to_solve: timeToSolve }]);

            if (scoreError) throw scoreError;

            // Get current best time
            const { data: playerData, error: playerError } = await supabase
                .from("players")
                .select("best_time")
                .eq("id", playerId)
                .single();

            if (playerError) throw playerError;

            // Update best time if applicable
            if (playerData.best_time === 0 || timeToSolve < playerData.best_time) {
                const { error: updateError } = await supabase
                    .from("players")
                    .update({ best_time: timeToSolve })
                    .eq("id", playerId);

                if (updateError) throw updateError;
            }

            return { success: true };
        } catch (error) {
            throw new ApiError(500, `Failed to submit score: ${error.message}`);
        }
    }

    /**
     * Get leaderboard (top players by best time)
     *
     * number [limit=10] - Number of players to return
     * return Promise - Array of player objects with id, username, best_time, and riddles_solved
     * throw ApiError || superbaseError - If leaderboard retrieval fails
     */
    static async getLeaderboard(limit = 10) {
        try {
            // First get players with best times
            const { data: players, error: playersError } = await supabase
                .from("players")
                .select("id, username, best_time")
                .not("best_time", "eq", 0)
                .order("best_time", { ascending: true })
                .limit(limit);

            if (playersError) throw playersError;

            // Get riddles solved count for each player
            const playersWithRiddleCounts = await Promise.all(
                players.map(async (player) => {
                    const { count, error: countError } = await supabase

                        .from("player_scores")
                        .select("*", { count: "exact", head: true }) // exact for accurate count, head to avoid returning rows
                        .eq("player_id", player.id);

                    if (countError) throw countError;

                    return {
                        ...player,
                        riddles_solved: count || 0,
                    };
                })
            );

            return playersWithRiddleCounts;
        } catch (error) {
            throw new ApiError(500, `Failed to get leaderboard: ${error.message}`);
        }
    }

    /**
     * Get player's stats and history
     */
    static async getPlayerStats(username) {
        try {
            // Get player
            const { data: player, error: playerError } = await supabase
                .from("players")
                .select("*")
                .eq("username", username)
                .single();

            if (playerError) {
                if (playerError.code === "PGRST116") throw new ApiError(404, "Player not found");

                throw playerError;
            }

            // Get player's scores
            const { data: scores, error: scoresError } = await supabase
                .from("player_scores")
                .select("riddle_id, time_to_solve, solved_at")
                .eq("player_id", player.id)
                .order("solved_at", { ascending: false });

            if (scoresError) throw scoresError;

            // Calculate stats
            const totalSolved = scores.length;
            const avgTime =
                totalSolved > 0 ? scores.reduce((sum, row) => sum + row.time_to_solve, 0) / totalSolved : 0;

            return {
                player,
                stats: {
                    total_solved: totalSolved,
                    avg_time: Math.round(avgTime),
                    best_time: player.best_time,
                },
                history: scores,
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, `Failed to get player stats: ${error.message}`);
        }
    }
}

export default Player;
