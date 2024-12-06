import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor(authService?: AuthService) {
    this.authService = authService || new AuthService();
  }

  register = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.register({ email, password });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login({ email, password });
      return res.json(result);
    } catch (error) {
      return res.status(401).json({ error: (error as Error).message });
    }
  };
}
