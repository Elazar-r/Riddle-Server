/**
 * Express Application Setup
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
config({ quiet: true });

// Import middleware
import { globalErrorHandler } from './middleware/errorHandler.js';
import requestLogger from './middleware/requestLogger.js';

// Create Express application
const app = express();

// Security middleware
app.use(helmet());
app.disable("x-powered-by");

// CORS configuration
app.use(
    cors({
        origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

// Basic middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logger
app.use(requestLogger);

// Routes
import rootRoutes from './routes/rootRoutes.js';
import riddlesRoutes from './routes/riddlesRoutes.js';
import playersRoutes from './routes/playersRoutes.js';
import authRoutes from './routes/authRoutes.js';

app.use("/", rootRoutes);
app.use("/riddles", riddlesRoutes);
app.use("/players", playersRoutes);
app.use("/auth", authRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Error handler (must be last)
app.use(globalErrorHandler);

export default app;