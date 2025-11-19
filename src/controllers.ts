import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

export const shortenUrl = async (req: Request, res: Response) => {
  try {
    const { long_url, custom_code } = req.body;

    if (!long_url) {
      return res.status(400).json({ error: 'long_url is required' });
    }

    let short_code = custom_code;

    if (short_code) {
      const existing = await prisma.shortenedURL.findUnique({
        where: { short_code },
      });
      if (existing) {
        return res.status(409).json({ error: 'Custom code already taken' });
      }
    } else {
      short_code = nanoid(6);
      // Ensure uniqueness (simple retry logic could be added here, but nanoid collision is rare)
    }

    const newUrl = await prisma.shortenedURL.create({
      data: {
        long_url,
        short_code,
      },
    });

    res.status(201).json({
      short_url: `${process.env.BASE_URL}/${newUrl.short_code}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const redirectUrl = async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;

    const url = await prisma.shortenedURL.findUnique({
      where: { short_code: shortCode },
    });

    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Async update click count (don't await to speed up redirect)
    prisma.shortenedURL.update({
      where: { short_code: shortCode },
      data: {
        click_count: { increment: 1 },
        last_clicked_at: new Date(),
      },
    }).catch((err: any) => console.error('Failed to update stats', err));

    res.redirect(url.long_url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;

    const url = await prisma.shortenedURL.findUnique({
      where: { short_code: shortCode },
    });

    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

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
