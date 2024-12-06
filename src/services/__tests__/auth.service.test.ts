/* eslint-disable @typescript-eslint/no-var-requires */
import { AuthService } from '../auth.service';
import { hash } from 'bcrypt';

const mockCreate = jest.fn();
const mockFindUnique = jest.fn();

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      create: (...args: any[]) => mockCreate(...args),
      findUnique: (...args: any[]) => mockFindUnique(...args),
    },
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockSign = jest.fn();
jest.mock('jsonwebtoken', () => ({
  sign: (...args: any[]) => mockSign(...args),
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockUser = {
      email: 'test@example.com',
      password: '123456',
    };

    const mockHashedPassword = 'hashed_password';
    const mockToken = 'mock_token';
    const mockCreatedUser = {
      id: 1,
      email: mockUser.email,
    };

    beforeEach(() => {
      (hash as jest.Mock).mockResolvedValue(mockHashedPassword);
      mockSign.mockReturnValue(mockToken);
      mockCreate.mockResolvedValue(mockCreatedUser);
    });

    it('deve registrar um usuário com sucesso', async () => {
      const result = await authService.register(mockUser);

      expect(hash).toHaveBeenCalledWith(mockUser.password, 10);
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          email: mockUser.email,
          password: mockHashedPassword,
        },
        select: {
          id: true,
          email: true,
        },
      });
      expect(mockSign).toHaveBeenCalledWith({ userId: mockCreatedUser.id }, expect.any(String), {
        expiresIn: '1d',
      });
      expect(result).toEqual({
        token: mockToken,
        user: mockCreatedUser,
      });
    });

    it('deve lidar com erro ao criar usuário', async () => {
      const mockError = new Error('Email já existe');
      mockCreate.mockRejectedValue(mockError);

      await expect(authService.register(mockUser)).rejects.toThrow(mockError);
    });

    it('deve lidar com erro ao gerar hash da senha', async () => {
      const mockError = new Error('Erro ao gerar hash');
      (hash as jest.Mock).mockRejectedValue(mockError);

      await expect(authService.register(mockUser)).rejects.toThrow(mockError);
    });
  });

  describe('login', () => {
    const mockUser = {
      email: 'test@example.com',
      password: '123456',
    };

    const mockDbUser = {
      id: 1,
      email: mockUser.email,
      password: 'hashed_password',
      deletedAt: null,
    };

    const mockToken = 'mock_token';

    beforeEach(() => {
      mockFindUnique.mockResolvedValue(mockDbUser);
      (require('bcrypt').compare as jest.Mock).mockResolvedValue(true);
      mockSign.mockReturnValue(mockToken);
    });

    it('deve fazer login com sucesso', async () => {
      const result = await authService.login(mockUser);

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email, deletedAt: null },
      });
      expect(require('bcrypt').compare).toHaveBeenCalledWith(
        mockUser.password,
        mockDbUser.password,
      );
      expect(mockSign).toHaveBeenCalledWith({ userId: mockDbUser.id }, expect.any(String), {
        expiresIn: '1d',
      });
      expect(result).toEqual({
        token: mockToken,
        user: {
          id: mockDbUser.id,
          email: mockDbUser.email,
        },
      });
    });

    it('deve rejeitar login com usuário não encontrado', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(authService.login(mockUser)).rejects.toThrow('Invalid credentials');
    });

    it('deve rejeitar login com senha incorreta', async () => {
      (require('bcrypt').compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(mockUser)).rejects.toThrow('Invalid credentials');
    });

    it('deve lidar com erro ao buscar usuário', async () => {
      const mockError = new Error('Erro ao buscar usuário');
      mockFindUnique.mockRejectedValue(mockError);

      await expect(authService.login(mockUser)).rejects.toThrow(mockError);
    });

    it('deve lidar com erro ao comparar senhas', async () => {
      const mockError = new Error('Erro ao comparar senhas');
      (require('bcrypt').compare as jest.Mock).mockRejectedValue(mockError);

      await expect(authService.login(mockUser)).rejects.toThrow(mockError);
    });

    it('deve rejeitar login com usuário deletado', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(authService.login(mockUser)).rejects.toThrow('Invalid credentials');
    });
  });
});
