import { Request, Response } from 'express';
import { UrlService } from '../services/url.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class UrlController {
  private urlService: UrlService;

  constructor(urlService?: UrlService) {
    this.urlService = urlService || new UrlService();
  }

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { originalUrl } = req.body;
      const url = await this.urlService.createShortUrl(originalUrl, req.userId);

      return res.json({
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        shortCode: url.shortCode,
      });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async redirect(req: Request, res: Response) {
    try {
      const { shortCode } = req.params;
      const url = await this.urlService.getUrlByCode(shortCode);
      return res.redirect(url.originalUrl);
    } catch (error) {
      return res.status(404).json({ error: 'URL not found' });
    }
  }

  async list(req: AuthenticatedRequest, res: Response) {
    try {
      const urls = await this.urlService.listUserUrls(req.userId!);
      return res.json(urls);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { originalUrl } = req.body;
      const url = await this.urlService.updateUrl(Number(id), req.userId!, originalUrl);
      return res.json(url);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await this.urlService.deleteUrl(Number(id), req.userId!);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  }
}
