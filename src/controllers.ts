/**
 * Controllers for URL shortening service
 * This file contains all the business logic for handling URL operations
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

// Initialize Prisma Client for database operations
const prisma = new PrismaClient();

/**
 * shortenUrl - Creates a shortened URL
 * 
 * This function handles the core URL shortening logic:
 * 1. Validates that a long_url is provided
 * 2. If a custom code is provided, checks if it's available
 * 3. If no custom code, generates a random 6-character code using nanoid
 * 4. Stores the mapping in the database
 * 5. Returns the complete short URL to the client
 * 
 * @param req - Express request object containing long_url and optional custom_code
 * @param res - Express response object
 * @returns JSON response with short_url or error message
 */
export const shortenUrl = async (req: Request, res: Response) => {
  try {
    // Extract long URL and optional custom code from request body
    const { long_url, custom_code } = req.body;

    // Validate that the long URL is provided
    // This is the only required field for creating a short URL
    if (!long_url) {
      return res.status(400).json({ error: 'long_url is required' });
    }

    let short_code = custom_code;

    // Handle custom code if provided by the user
    if (short_code) {
      // Check if the custom code is already in use
      // This prevents duplicate short codes in the system
      const existing = await prisma.shortenedURL.findUnique({
        where: { short_code },
      });

      // If code exists, return 409 Conflict status
      if (existing) {
        return res.status(409).json({ error: 'Custom code already taken' });
      }
    } else {
      // Generate a random 6-character short code using nanoid
      // nanoid provides URL-safe random strings with very low collision probability
      // With 6 characters, we have ~56 trillion possible combinations
      short_code = nanoid(6);

      // Note: In a high-volume production system, you might want to add
      // retry logic here to handle the rare case of collisions
    }

    // Create a new record in the database
    // Prisma will automatically set created_at timestamp
    // click_count defaults to 0, last_clicked_at defaults to null
    const newUrl = await prisma.shortenedURL.create({
      data: {
        long_url,
        short_code,
      },
    });

    // Construct and return the complete short URL
    // BASE_URL comes from environment variables (e.g., http://localhost:3000)
    // Status 201 indicates successful resource creation
    res.status(201).json({
      short_url: `${process.env.BASE_URL}/${newUrl.short_code}`,
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error);
    // Return generic error to client (don't expose internal details)
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * redirectUrl - Handles redirection from short URL to original URL
 * 
 * This function performs two operations:
 * 1. Looks up the original URL by short code
 * 2. Asynchronously updates click statistics (non-blocking for performance)
 * 3. Redirects the user to the original URL
 * 
 * Performance optimization: The stats update is fire-and-forget to minimize
 * redirect latency. Even if the stats update fails, the redirect still works.
 * 
 * @param req - Express request object with shortCode in params
 * @param res - Express response object
 * @returns HTTP redirect or error message
 */
export const redirectUrl = async (req: Request, res: Response) => {
  try {
    // Extract the short code from the URL parameter
    // e.g., for /abc123, shortCode would be "abc123"
    const { shortCode } = req.params;

    // Look up the URL record in the database
    const url = await prisma.shortenedURL.findUnique({
      where: { short_code: shortCode },
    });

    // If no matching short code is found, return 404
    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Update click statistics asynchronously (fire-and-forget)
    // We don't await this to minimize redirect latency
    // The update happens in the background while the user is redirected
    // This is a performance optimization - redirect speed is more important
    // than ensuring the stats are updated before redirecting
    prisma.shortenedURL.update({
      where: { short_code: shortCode },
      data: {
        click_count: { increment: 1 },  // Atomic increment operation
        last_clicked_at: new Date(),     // Record timestamp of this click
      },
    }).catch((err: any) => console.error('Failed to update stats', err));

    // Perform the HTTP redirect to the original long URL
    // Status 302 (temporary redirect) is used by default
    res.redirect(url.long_url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * getStats - Retrieves analytics for a shortened URL
 * 
 * Returns detailed statistics including:
 * - The short code
 * - Original long URL
 * - Total click count
 * - Creation timestamp
 * - Last click timestamp
 * 
 * @param req - Express request object with shortCode in params
 * @param res - Express response object
 * @returns JSON object with URL statistics or error message
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    // Extract the short code from URL parameters
    const { shortCode } = req.params;

    // Retrieve the complete URL record from database
    const url = await prisma.shortenedURL.findUnique({
      where: { short_code: shortCode },
    });

    // Return 404 if the short code doesn't exist
    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Return all relevant statistics as JSON
    // This provides a complete view of the URL's usage
    res.json({
      short_code: url.short_code,
      long_url: url.long_url,
      click_count: url.click_count,
      created_at: url.created_at,
      last_clicked_at: url.last_clicked_at,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * getAllLinks - Retrieves all shortened URLs in the system
 * 
 * Returns a list of all URL records, ordered by creation date (newest first).
 * This is useful for:
 * - Admin dashboards
 * - Viewing all created links
 * - Analytics and reporting
 * 
 * Note: In a production system with many URLs, you would want to add
 * pagination to this endpoint to avoid returning too much data at once.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON array of all URL records or error message
 */
export const getAllLinks = async (req: Request, res: Response) => {
  try {
    // Fetch all URL records from the database
    // Ordered by created_at in descending order (newest first)
    const links = await prisma.shortenedURL.findMany({
      orderBy: { created_at: 'desc' },
    });

    // Return the complete list as JSON
    res.json(links);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
