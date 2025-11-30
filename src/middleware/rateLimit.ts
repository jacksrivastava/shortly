/**
 * Rate Limiting Middleware
 * 
 * Purpose: Implements a sliding window rate limiter using Redis to prevent abuse.
 * Limits the number of requests a single IP can make within a specified time window.
 * 
 * Why: Protects the service from denial-of-service attacks and excessive usage,
 * ensuring fair resource allocation among users.
 */
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10');

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Identify user by IP address
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rate_limit:${ip}`;

    // Get current request count
    const current = await redis.get(key);

    // Check if limit exceeded
    if (current && parseInt(current) >= MAX_REQUESTS) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    // Increment request count atomically
    const multi = redis.multi();
    multi.incr(key);
    if (!current) {
      // Set expiration if it's the first request in the window
      multi.expire(key, WINDOW_MS / 1000);
    }
    await multi.exec();

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    // Fail open if redis is down to avoid blocking legitimate traffic
    next();
  }
};
