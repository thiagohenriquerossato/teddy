import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { IAuthRequest, IAuthResponse } from '../interfaces/auth.interface';
import { ApiError } from '../errors/ApiError';

export class AuthService {
  async emailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return !!user;
  }

  async register(data: IAuthRequest): Promise<IAuthResponse> {
    const emailAlreadyExists = await this.emailExists(data.email);
    if (emailAlreadyExists) {
      throw new ApiError('Email já está em uso', 400);
    }

    const hashedPassword = await hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d',
    });

    return { token, user };
  }

  async login(data: IAuthRequest): Promise<IAuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email, deletedAt: null },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const validPassword = await compare(data.password, user.password);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d',
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
