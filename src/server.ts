/**
 * Server Entry Point
 * 
 * Purpose: Initializes the Express application, configures middleware (CORS, Helmet, JSON parsing),
 * and starts the HTTP server.
 * 
 * Why: This file serves as the central hub for the application, wiring together all components
 * and exposing the service to the network.
 */
import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import { router } from './routes';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, '../public'))); // Serve static frontend files

// Routes
app.use('/', router);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
