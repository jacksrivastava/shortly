import { Router } from 'express';
import { shortenUrl, redirectUrl, getStats } from './controllers';
import { rateLimiter } from './middleware/rateLimit';

export const router = Router();



router.post('/api/shorten', rateLimiter, shortenUrl);
router.get('/api/stats/:shortCode', getStats);
router.get('/:shortCode', redirectUrl);


