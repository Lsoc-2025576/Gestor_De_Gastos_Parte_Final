import { type Response } from 'express';
import { SavingsService } from '../services/savings.service.js';
import { type AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class SavingsController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'No autorizado' });
        return;
      }
      const data = await SavingsService.getSavingsByUser(userId);
      res.json({ data });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener los ahorros' });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'No autorizado' });
        return;
      }
      const saving = await SavingsService.createSaving(userId, req.body);
      res.status(201).json({ message: 'Ahorro registrado exitosamente', data: saving });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al registrar el ahorro' });
    }
  }
}