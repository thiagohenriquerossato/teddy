import { Router } from 'express';
import { UrlController } from '../controllers/url.controller';
import { UrlService } from '../services/url.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { optionalAuthMiddleware } from '../middlewares/optional-auth.middleware';
import { validate, validations } from '../middlewares/validation.middleware';

const router = Router();
const authService = new AuthService();
const urlService = new UrlService();
const authController = new AuthController(authService);
const urlController = new UrlController(urlService);

// Auth routes
router.post(
  '/auth/register',
  validate([
    { field: 'email', validate: validations.isEmail, message: 'Email inválido' },
    {
      field: 'password',
      validate: validations.minLength(6),
      message: 'A senha deve ter no mínimo 6 caracteres',
    },
  ]),
  (req, res) => authController.register(req, res),
);

router.post(
  '/auth/login',
  validate([
    { field: 'email', validate: validations.isEmail, message: 'Email inválido' },
    {
      field: 'password',
      validate: validations.minLength(6),
      message: 'A senha deve ter no mínimo 6 caracteres',
    },
  ]),
  (req, res) => authController.login(req, res),
);

// URL routes
router.get('/urls', authMiddleware, (req, res) => urlController.list(req, res));

router.post(
  '/urls',
  optionalAuthMiddleware,
  validate([{ field: 'originalUrl', validate: validations.isUrl, message: 'URL inválida' }]),
  (req, res) => urlController.create(req, res),
);

router.delete('/urls/:id', authMiddleware, (req, res) => urlController.delete(req, res));

router.get('/:shortCode', (req, res) => urlController.redirect(req, res));

export default router;
