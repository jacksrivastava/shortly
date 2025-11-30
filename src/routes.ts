/**
 * API Routes Configuration
 * 
 * Purpose: Defines the API endpoints and maps them to their respective controller functions.
 * Includes middleware application (like rate limiting) for specific routes.
 * 
 * Why: Centralizes route definitions to make the API structure clear and maintainable.
 * Separates routing logic from business logic (controllers).
 */
import { Router } from 'express';
import { shortenUrl, redirectUrl, getStats, getAllLinks } from './controllers';
import { rateLimiter } from './middleware/rateLimit';

export const router = Router();

// API Routes
router.post('/api/shorten', rateLimiter, shortenUrl); // Create a short URL
router.get('/api/links', getAllLinks); // List all shortened URLs
router.get('/api/stats/:shortCode', getStats); // Get stats for a short URL

// Redirect Route (Catch-all for short codes)
router.get('/:shortCode', redirectUrl);


