import { Request, Response } from 'express';
import { validate, validations } from '../validation.middleware';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('validate', () => {
    it('deve passar a validação quando todos os campos são válidos', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: '123456',
      };

      const rules = [
        { field: 'email', validate: validations.isEmail, message: 'Email inválido' },
        { field: 'password', validate: validations.minLength(6), message: 'Senha muito curta' },
      ];

      validate(rules)(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando campos são inválidos', () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: '12345',
      };

      const rules = [
        { field: 'email', validate: validations.isEmail, message: 'Email inválido' },
        { field: 'password', validate: validations.minLength(6), message: 'Senha muito curta' },
      ];

      validate(rules)(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erro de validação',
        details: expect.arrayContaining([
          expect.objectContaining({ field: 'email', message: 'Email inválido' }),
          expect.objectContaining({ field: 'password', message: 'Senha muito curta' }),
        ]),
      });
    });
  });

  describe('validations', () => {
    describe('isEmail', () => {
      it('deve validar emails corretos', () => {
        expect(validations.isEmail('test@example.com')).toBe(true);
        expect(validations.isEmail('user.name+tag@domain.com')).toBe(true);
      });

      it('deve rejeitar emails inválidos', () => {
        expect(validations.isEmail('invalid-email')).toBe(false);
        expect(validations.isEmail('')).toBe(false);
        expect(validations.isEmail(123)).toBe(false);
      });
    });

    describe('minLength', () => {
      it('deve validar strings com comprimento mínimo', () => {
        expect(validations.minLength(3)('123')).toBe(true);
        expect(validations.minLength(3)('1234')).toBe(true);
      });

      it('deve rejeitar strings muito curtas', () => {
        expect(validations.minLength(3)('12')).toBe(false);
        expect(validations.minLength(3)('')).toBe(false);
        expect(validations.minLength(3)(123)).toBe(false);
      });
    });

    describe('isUrl', () => {
      it('deve validar URLs válidas', () => {
        expect(validations.isUrl('http://example.com')).toBe(true);
        expect(validations.isUrl('https://sub.domain.com/path')).toBe(true);
      });

      it('deve rejeitar URLs inválidas', () => {
        expect(validations.isUrl('not-a-url')).toBe(false);
        expect(validations.isUrl('')).toBe(false);
        expect(validations.isUrl(123)).toBe(false);
      });
    });

    describe('isNumeric', () => {
      it('deve validar strings numéricas', () => {
        expect(validations.isNumeric('123')).toBe(true);
        expect(validations.isNumeric('0')).toBe(true);
      });

      it('deve rejeitar strings não numéricas', () => {
        expect(validations.isNumeric('abc')).toBe(false);
        expect(validations.isNumeric('')).toBe(false);
        expect(validations.isNumeric(123)).toBe(false);
      });
    });

    describe('exactLength', () => {
      it('deve validar strings com comprimento exato', () => {
        expect(validations.exactLength(3)('123')).toBe(true);
        expect(validations.exactLength(6)('abcdef')).toBe(true);
      });

      it('deve rejeitar strings com comprimento diferente', () => {
        expect(validations.exactLength(3)('1234')).toBe(false);
        expect(validations.exactLength(3)('12')).toBe(false);
        expect(validations.exactLength(3)('')).toBe(false);
        expect(validations.exactLength(3)(123)).toBe(false);
      });
    });
  });
});
