import { UrlService } from '../url.service';
import prisma from '../../lib/prisma';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('nanoid', () => ({
  nanoid: () => 'abc123',
}));

jest.mock('../../lib/prisma', () => ({
  url: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
}));

describe('UrlService', () => {
  let urlService: UrlService;
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  beforeEach(() => {
    urlService = new UrlService();
    jest.clearAllMocks();
  });

  describe('createShortUrl', () => {
    it('deve criar uma URL encurtada com sucesso', async () => {
      const mockUrl = {
        id: 1,
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        shortUrl: 'http://localhost:3000/abc123',
        userId: 1,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrisma.url.create.mockResolvedValue(mockUrl);

      const result = await urlService.createShortUrl('https://example.com', 1);

      expect(result).toEqual(mockUrl);
      expect(mockPrisma.url.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          originalUrl: 'https://example.com',
          userId: 1,
          shortCode: expect.any(String),
          shortUrl: expect.stringContaining('http://localhost:3000/'),
        }),
      });
    });

    it('deve lançar erro ao falhar na criação da URL', async () => {
      mockPrisma.url.create.mockRejectedValue(new Error('Database error'));

      await expect(async () => {
        await urlService.createShortUrl('https://example.com');
      }).rejects.toEqual(
        expect.objectContaining({
          message: 'Erro ao criar URL encurtada',
          statusCode: 500,
        }),
      );
    });
  });

  describe('getUrlByCode', () => {
    it('deve retornar uma URL válida e incrementar o contador de cliques', async () => {
      const mockUrl = {
        id: 1,
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        shortUrl: 'http://localhost:3000/abc123',
        userId: 1,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrisma.url.findFirst.mockResolvedValue(mockUrl);
      mockPrisma.url.update.mockResolvedValue({ ...mockUrl, clickCount: 1 });

      const result = await urlService.getUrlByCode('abc123');

      expect(result).toEqual(mockUrl);
      expect(mockPrisma.url.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { clickCount: { increment: 1 } },
      });
    });

    it('deve lançar erro quando a URL não for encontrada', async () => {
      mockPrisma.url.findFirst.mockResolvedValue(null);

      await expect(urlService.getUrlByCode('invalid')).rejects.toThrow('URL não encontrada');
    });

    it('deve lançar erro genérico quando ocorrer falha no banco de dados', async () => {
      mockPrisma.url.findFirst.mockRejectedValue(new Error('Database connection error'));

      await expect(urlService.getUrlByCode('abc123')).rejects.toEqual(
        expect.objectContaining({
          message: 'Erro ao buscar URL',
          statusCode: 500,
        }),
      );
    });
  });

  describe('listUserUrls', () => {
    it('deve listar todas as URLs ativas do usuário', async () => {
      const mockUrls = [
        {
          id: 1,
          originalUrl: 'https://example1.com',
          shortCode: 'abc123',
          shortUrl: 'http://localhost:3000/abc123',
          userId: 1,
          clickCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 2,
          originalUrl: 'https://example2.com',
          shortCode: 'def456',
          shortUrl: 'http://localhost:3000/def456',
          userId: 1,
          clickCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      mockPrisma.url.findMany.mockResolvedValue(mockUrls);

      const result = await urlService.listUserUrls(1);

      expect(result).toEqual(mockUrls);
      expect(mockPrisma.url.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('updateUrl', () => {
    it('deve atualizar a URL com sucesso', async () => {
      const mockUrl = {
        id: 1,
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        shortUrl: 'http://localhost:3000/abc123',
        userId: 1,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrisma.url.findFirst.mockResolvedValue(mockUrl);
      mockPrisma.url.update.mockResolvedValue({
        ...mockUrl,
        originalUrl: 'https://updated-example.com',
      });

      const result = await urlService.updateUrl(1, 1, 'https://updated-example.com');

      expect(result.originalUrl).toBe('https://updated-example.com');
      expect(mockPrisma.url.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { originalUrl: 'https://updated-example.com' },
      });
    });

    it('deve lançar erro ao tentar atualizar URL inexistente', async () => {
      mockPrisma.url.findFirst.mockResolvedValue(null);

      await expect(urlService.updateUrl(1, 1, 'https://updated-example.com')).rejects.toThrow(
        'URL not found',
      );
    });
  });

  describe('deleteUrl', () => {
    it('deve marcar a URL como deletada com sucesso', async () => {
      const mockUrl = {
        id: 1,
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        shortUrl: 'http://localhost:3000/abc123',
        userId: 1,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrisma.url.findFirst.mockResolvedValue(mockUrl);
      mockPrisma.url.update.mockResolvedValue({
        ...mockUrl,
        deletedAt: new Date(),
      });

      const result = await urlService.deleteUrl(1, 1);

      expect(result.deletedAt).toBeTruthy();
      expect(mockPrisma.url.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('deve lançar erro ao tentar deletar URL inexistente', async () => {
      mockPrisma.url.findFirst.mockResolvedValue(null);

      await expect(urlService.deleteUrl(1, 1)).rejects.toThrow('URL not found');
    });
  });
});
