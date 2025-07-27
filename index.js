/**
 * Entry Point
 *
 * Main entry point of the application:
 * 1. Connects to MongoDB
 * 2. Tests Supabase connection
 * 3. Starts the Express server
 * 4. Handles process-level errors
 */

import dotenv from 'dotenv';
dotenv.config({ quiet: true });
import { connectMongoDB } from './src/db/mongodb.js';
import { testSupabaseConnection } from './src/db/supabase.js';
import app from './src/server.js';

const PORT = process.env.PORT || 3000;

/**
 * Start server after initializing databases
 */
async function startServer() {
  try {
    console.log("Starting Riddles Server...");

    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await connectMongoDB();

    // Test Supabase connection
    console.log(" Testing Supabase connection...");
    await testSupabaseConnection();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✔ Riddles server running on http://localhost:${PORT}`);
      console.log(`✔ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("✔ All systems ready!");
    });
  } catch (error) {
    console.error("✘ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle unexpected terminations
process.on("uncaughtException", (error) => {
  console.error("✘ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("✘ Unhandled Promise Rejection:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("✔ SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("✔ SIGINT received, shutting down gracefully...");
  process.exit(0);
});

// Start the application
startServer();