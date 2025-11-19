import { Request, Response } from 'express';
import { shortenUrl, redirectUrl, getStats } from './controllers';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mPrisma = {
    shortenedURL: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

const prisma = new PrismaClient();

describe('Controllers', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;
  let redirect: jest.Mock;

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    redirect = jest.fn();
    res = { status, json, redirect };
    jest.clearAllMocks();
  });

  describe('shortenUrl', () => {
    it('should create a short URL with random code', async () => {
      req = { body: { long_url: 'https://example.com' } };
      (prisma.shortenedURL.create as jest.Mock).mockResolvedValue({
        short_code: 'random',
        long_url: 'https://example.com',
      });

      await shortenUrl(req as Request, res as Response);

      expect(prisma.shortenedURL.create).toHaveBeenCalled();
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        short_url: expect.stringContaining('random'),
      }));
    });

    it('should create a short URL with custom code', async () => {
      req = { body: { long_url: 'https://example.com', custom_code: 'custom' } };
      (prisma.shortenedURL.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.shortenedURL.create as jest.Mock).mockResolvedValue({
        short_code: 'custom',
        long_url: 'https://example.com',
      });

      await shortenUrl(req as Request, res as Response);

      expect(prisma.shortenedURL.findUnique).toHaveBeenCalledWith({ where: { short_code: 'custom' } });
      expect(prisma.shortenedURL.create).toHaveBeenCalled();
      expect(status).toHaveBeenCalledWith(201);
    });

    it('should return 409 if custom code exists', async () => {
      req = { body: { long_url: 'https://example.com', custom_code: 'taken' } };
      (prisma.shortenedURL.findUnique as jest.Mock).mockResolvedValue({ short_code: 'taken' });

      await shortenUrl(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(409);
    });
  });

  describe('redirectUrl', () => {
    it('should redirect to long URL', async () => {
      req = { params: { shortCode: 'exists' } };
      (prisma.shortenedURL.findUnique as jest.Mock).mockResolvedValue({
        short_code: 'exists',
        long_url: 'https://example.com',
      });
      (prisma.shortenedURL.update as jest.Mock).mockResolvedValue({});

      await redirectUrl(req as Request, res as Response);

      expect(redirect).toHaveBeenCalledWith('https://example.com');
      expect(prisma.shortenedURL.update).toHaveBeenCalled();
    });

    it('should return 404 if not found', async () => {
      req = { params: { shortCode: 'missing' } };
      (prisma.shortenedURL.findUnique as jest.Mock).mockResolvedValue(null);

      await redirectUrl(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(404);
    });
  });
});
