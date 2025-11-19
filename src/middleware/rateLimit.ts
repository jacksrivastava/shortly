import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10');

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rate_limit:${ip}`;

    const current = await redis.get(key);

    if (current && parseInt(current) >= MAX_REQUESTS) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    const multi = redis.multi();
    multi.incr(key);
    if (!current) {
      multi.expire(key, WINDOW_MS / 1000);
    }
    await multi.exec();

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    // Fail open if redis is down
    next();
  }
};
