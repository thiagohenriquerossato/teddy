import { Request, Response } from 'express';
import { UrlController } from '../url.controller';
import { UrlService } from '../../services/url.service';
import { validate, validations } from '../../middlewares/validation.middleware';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

jest.mock('nanoid', () => ({
  nanoid: () => 'abc123',
}));

jest.mock('../../services/url.service');

describe('UrlController', () => {
  let urlController: UrlController;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockUrlService: jest.Mocked<UrlService>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
      userId: 1,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
      send: jest.fn(),
    };
    mockUrlService = new UrlService() as jest.Mocked<UrlService>;
    nextFunction = jest.fn();
    urlController = new UrlController(mockUrlService);
  });

  describe('Métodos do Controller', () => {
    describe('list', () => {
      it('deve listar URLs do usuário com sucesso', async () => {
        const mockUrls = [
          {
            id: 1,
            originalUrl: 'https://example1.com',
            shortUrl: 'http://localhost:3000/abc123',
            shortCode: 'abc123',
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 2,
            originalUrl: 'https://example2.com',
            shortUrl: 'http://localhost:3000/def456',
            shortCode: 'def456',
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        mockUrlService.listUserUrls = jest.fn().mockResolvedValue(mockUrls);

        await urlController.list(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUrlService.listUserUrls).toHaveBeenCalledWith(mockRequest.userId);
        expect(mockResponse.json).toHaveBeenCalledWith(mockUrls);
        expect(mockResponse.status).not.toHaveBeenCalled();
      });

      it('deve retornar erro ao falhar a listagem', async () => {
        const mockError = new Error('Erro ao listar URLs');
        mockUrlService.listUserUrls = jest.fn().mockRejectedValue(mockError);

        await urlController.list(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUrlService.listUserUrls).toHaveBeenCalledWith(mockRequest.userId);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: mockError.message });
      });

      it('deve lidar com userId indefinido', async () => {
        mockRequest.userId = undefined;
        const mockError = new Error('ID do usuário não fornecido');
        mockUrlService.listUserUrls = jest.fn().mockRejectedValue(mockError);

        await urlController.list(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUrlService.listUserUrls).toHaveBeenCalledWith(undefined);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: mockError.message });
      });
    });

    describe('create', () => {
      it('deve criar uma URL encurtada com sucesso', async () => {
        const mockUrl = {
          originalUrl: 'https://example.com',
          shortUrl: 'http://localhost:3000/abc123',
          shortCode: 'abc123',
        };

        mockRequest.body = { originalUrl: mockUrl.originalUrl };
        mockUrlService.createShortUrl = jest.fn().mockResolvedValue(mockUrl);

        await urlController.create(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUrlService.createShortUrl).toHaveBeenCalledWith(
          mockUrl.originalUrl,
          mockRequest.userId,
        );
        expect(mockResponse.json).toHaveBeenCalledWith(mockUrl);
        expect(mockResponse.status).not.toHaveBeenCalled();
      });

      it('deve retornar erro ao falhar a criação', async () => {
        const mockError = new Error('Erro ao criar URL');
        mockRequest.body = { originalUrl: 'https://example.com' };
        mockUrlService.createShortUrl = jest.fn().mockRejectedValue(mockError);

        await urlController.create(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUrlService.createShortUrl).toHaveBeenCalledWith(
          'https://example.com',
          mockRequest.userId,
        );
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: mockError.message });
      });

      it('deve lidar com userId indefinido', async () => {
        mockRequest.userId = undefined;
        const mockError = new Error('ID do usuário não fornecido');
        mockRequest.body = { originalUrl: 'https://example.com' };
        mockUrlService.createShortUrl = jest.fn().mockRejectedValue(mockError);

        await urlController.create(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUrlService.createShortUrl).toHaveBeenCalledWith(
          'https://example.com',
          undefined,
        );
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: mockError.message });
      });

      it('deve lidar com originalUrl ausente', async () => {
        mockRequest.body = {};
        const mockError = new Error('URL original não fornecida');
        mockUrlService.createShortUrl = jest.fn().mockRejectedValue(mockError);

        await urlController.create(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUrlService.createShortUrl).toHaveBeenCalledWith(undefined, mockRequest.userId);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: mockError.message });
      });
    });

    describe('redirect', () => {
      it('deve redirecionar para a URL original', async () => {
        const mockUrl = {
          originalUrl: 'https://example.com',
          shortCode: 'abc123',
        };

        mockRequest.params = { shortCode: mockUrl.shortCode };
        mockUrlService.getUrlByCode = jest.fn().mockResolvedValue(mockUrl);

        await urlController.redirect(mockRequest as Request, mockResponse as Response);

        expect(mockUrlService.getUrlByCode).toHaveBeenCalledWith(mockUrl.shortCode);
        expect(mockResponse.redirect).toHaveBeenCalledWith(mockUrl.originalUrl);
      });

      it('deve retornar erro quando a URL não existe', async () => {
        mockRequest.params = { shortCode: 'invalid' };
        mockUrlService.getUrlByCode = jest.fn().mockRejectedValue(new Error('URL not found'));

        await urlController.redirect(mockRequest as Request, mockResponse as Response);

        expect(mockUrlService.getUrlByCode).toHaveBeenCalledWith('invalid');
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'URL not found' });
      });

      it('deve lidar com shortCode ausente', async () => {
        mockRequest.params = {};
        mockUrlService.getUrlByCode = jest.fn().mockRejectedValue(new Error('URL not found'));

        await urlController.redirect(mockRequest as Request, mockResponse as Response);

        expect(mockUrlService.getUrlByCode).toHaveBeenCalledWith(undefined);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'URL not found' });
      });
    });

    describe('update', () => {
      it('deve atualizar a URL com sucesso', async () => {
        const mockUrl = {
          id: 1,
          originalUrl: 'https://updated-example.com',
          shortCode: 'abc123',
        };

        mockRequest.params = { id: '1' };
        mockRequest.body = { originalUrl: mockUrl.originalUrl };
        mockUrlService.updateUrl = jest.fn().mockResolvedValue(mockUrl);

        await urlController.update(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUrlService.updateUrl).toHaveBeenCalledWith(
          1,
          mockRequest.userId,
          mockUrl.originalUrl,
        );
        expect(mockResponse.json).toHaveBeenCalledWith(mockUrl);
      });

      it('deve retornar erro ao falhar a atualização', async () => {
        const mockError = new Error('URL não encontrada');
        mockRequest.params = { id: '1' };
        mockRequest.body = { originalUrl: 'https://example.com' };
        mockUrlService.updateUrl = jest.fn().mockRejectedValue(mockError);

        await urlController.update(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUrlService.updateUrl).toHaveBeenCalledWith(
          1,
          mockRequest.userId,
          'https://example.com',
        );
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: mockError.message });
      });

      it('deve lidar com id ausente', async () => {
        mockRequest.params = {};
        mockRequest.body = { originalUrl: 'https://example.com' };
        const mockError = new Error('ID não fornecido');
        mockUrlService.updateUrl = jest.fn().mockRejectedValue(mockError);

        await urlController.update(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUrlService.updateUrl).toHaveBeenCalledWith(
          NaN,
          mockRequest.userId,
          'https://example.com',
        );
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: mockError.message });
      });

      it('deve lidar com originalUrl ausente', async () => {
        mockRequest.params = { id: '1' };
        mockRequest.body = {};
        const mockError = new Error('URL original não fornecida');
        mockUrlService.updateUrl = jest.fn().mockRejectedValue(mockError);

        await urlController.update(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUrlService.updateUrl).toHaveBeenCalledWith(1, mockRequest.userId, undefined);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: mockError.message });
      });
    });

    describe('delete', () => {
      it('deve deletar a URL com sucesso', async () => {
        mockRequest.params = { id: '1' };
        mockUrlService.deleteUrl = jest.fn().mockResolvedValue(undefined);

        await urlController.delete(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUrlService.deleteUrl).toHaveBeenCalledWith(1, mockRequest.userId);
        expect(mockResponse.status).toHaveBeenCalledWith(204);
        expect(mockResponse.send).toHaveBeenCalled();
      });

      it('deve retornar erro ao falhar a deleção', async () => {
        const mockError = new Error('URL não encontrada');
        mockRequest.params = { id: '1' };
        mockUrlService.deleteUrl = jest.fn().mockRejectedValue(mockError);

        await urlController.delete(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUrlService.deleteUrl).toHaveBeenCalledWith(1, mockRequest.userId);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: mockError.message });
      });

      it('deve lidar com id ausente', async () => {
        mockRequest.params = {};
        const mockError = new Error('ID não fornecido');
        mockUrlService.deleteUrl = jest.fn().mockRejectedValue(mockError);

        await urlController.delete(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUrlService.deleteUrl).toHaveBeenCalledWith(NaN, mockRequest.userId);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: mockError.message });
      });
    });
  });

  describe('Validação de Criação de URL', () => {
    const validationRules = [
      { field: 'originalUrl', validate: validations.isUrl, message: 'URL inválida' },
    ];

    it('deve aceitar URL válida', () => {
      mockRequest.body = {
        originalUrl: 'https://example.com',
      };

      const middleware = validate(validationRules);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('deve rejeitar URL inválida', () => {
      mockRequest.body = {
        originalUrl: 'invalid-url',
      };

      const middleware = validate(validationRules);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Erro de validação',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'originalUrl',
              message: 'URL inválida',
            }),
          ]),
        }),
      );
    });
  });
});
