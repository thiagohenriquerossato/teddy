import { Request, Response } from 'express';
import { AuthController } from '../auth.controller';
import { AuthService } from '../../services/auth.service';
import { validate, validations } from '../../middlewares/validation.middleware';

jest.mock('../../services/auth.service');

describe('AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockAuthService: jest.Mocked<AuthService>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockAuthService = new AuthService() as jest.Mocked<AuthService>;
    nextFunction = jest.fn();
    authController = new AuthController(mockAuthService);
  });

  describe('Métodos do Controller', () => {
    describe('register', () => {
      it('deve registrar um usuário com sucesso', async () => {
        const mockUser = {
          email: 'test@example.com',
          password: '123456',
        };

        const mockResult = {
          token: 'mock-token',
          user: {
            id: 1,
            email: mockUser.email,
          },
        };

        mockRequest.body = mockUser;
        mockAuthService.register = jest.fn().mockResolvedValue(mockResult);

        await authController.register(mockRequest as Request, mockResponse as Response);

        expect(mockAuthService.register).toHaveBeenCalledWith(mockUser);
        expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
        expect(mockResponse.status).toHaveBeenCalledWith(201);
      });

      it('deve retornar erro ao falhar o registro', async () => {
        const mockUser = {
          email: 'test@example.com',
          password: '123456',
        };

        const mockError = new Error('Email já existe');
        mockRequest.body = mockUser;
        mockAuthService.register = jest.fn().mockRejectedValue(mockError);

        await authController.register(mockRequest as Request, mockResponse as Response);

        expect(mockAuthService.register).toHaveBeenCalledWith(mockUser);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: mockError.message });
      });
    });

    describe('login', () => {
      it('deve fazer login com sucesso', async () => {
        const mockCredentials = {
          email: 'test@example.com',
          password: '123456',
        };

        const mockResult = {
          token: 'mock-token',
          user: {
            id: 1,
            email: mockCredentials.email,
          },
        };

        mockRequest.body = mockCredentials;
        mockAuthService.login = jest.fn().mockResolvedValue(mockResult);

        await authController.login(mockRequest as Request, mockResponse as Response);

        expect(mockAuthService.login).toHaveBeenCalledWith(mockCredentials);
        expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
        expect(mockResponse.status).not.toHaveBeenCalled();
      });

      it('deve retornar erro ao falhar o login', async () => {
        const mockCredentials = {
          email: 'test@example.com',
          password: 'wrong-password',
        };

        const mockError = new Error('Credenciais inválidas');
        mockRequest.body = mockCredentials;
        mockAuthService.login = jest.fn().mockRejectedValue(mockError);

        await authController.login(mockRequest as Request, mockResponse as Response);

        expect(mockAuthService.login).toHaveBeenCalledWith(mockCredentials);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: mockError.message });
      });
    });
  });

  describe('Validação de Registro', () => {
    const validationRules = [
      { field: 'email', validate: validations.isEmail, message: 'Email inválido' },
      {
        field: 'password',
        validate: validations.minLength(6),
        message: 'A senha deve ter no mínimo 6 caracteres',
      },
    ];

    it('deve aceitar dados válidos', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: '123456',
      };

      const middleware = validate(validationRules);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('deve rejeitar email inválido', () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: '123456',
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
              field: 'email',
              message: 'Email inválido',
            }),
          ]),
        }),
      );
    });
  });
});
