import { Router } from 'express';
import { shortenUrl, redirectUrl, getStats } from './controllers';
import { rateLimiter } from './middleware/rateLimit';

export const router = Router();

// API Routes
router.post('/api/shorten', rateLimiter, shortenUrl); // Create a short URL
router.get('/api/stats/:shortCode', getStats); // Get stats for a short URL

// Redirect Route (Catch-all for short codes)
router.get('/:shortCode', redirectUrl);


