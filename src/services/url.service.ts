import { nanoid } from 'nanoid';
import prisma from '../lib/prisma';
import { ApiError } from '../errors/ApiError';

export class UrlService {
  async createShortUrl(originalUrl: string, userId?: number) {
    try {
      const shortCode = nanoid(6);
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const shortUrl = `${baseUrl}/${shortCode}`;

      const result = await prisma.url.create({
        data: {
          originalUrl,
          shortCode,
          shortUrl,
          userId,
        },
      });
      return result;
    } catch (error) {
      throw new ApiError('Erro ao criar URL encurtada', 500);
    }
  }

  async getUrlByCode(shortCode: string) {
    try {
      const url = await prisma.url.findFirst({
        where: {
          shortCode,
          deletedAt: null,
        },
      });

      if (!url) {
        throw new ApiError('URL não encontrada', 404);
      }

      await prisma.url.update({
        where: { id: url.id },
        data: { clickCount: { increment: 1 } },
      });

      return url;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Erro ao buscar URL', 500);
    }
  }

  async listUserUrls(userId: number) {
    return prisma.url.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateUrl(id: number, userId: number, originalUrl: string) {
    const url = await prisma.url.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!url) {
      throw new Error('URL not found');
    }

    return prisma.url.update({
      where: { id },
      data: { originalUrl },
    });
  }

  async deleteUrl(id: number, userId: number) {
    const url = await prisma.url.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!url) {
      throw new Error('URL not found');
    }

    return prisma.url.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
