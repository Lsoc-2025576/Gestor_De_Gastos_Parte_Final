import { type Response } from 'express';
import { ExpenseService } from '../services/expense.services.js';
import type { CreateExpenseDto, UpdateExpenseDto } from '../dto/expense.dto.js';
import { type AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class ExpenseController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'No autorizado' });
        return;
      }
      const data = await ExpenseService.getAllExpenses(userId);
      res.json({ data });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error interno al obtener los gastos' });
    }
  }

  static async getSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'No autorizado' });
        return;
      }
      const summary = await ExpenseService.getSummary(userId);
      res.json({ data: summary });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener el resumen de gastos' });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'No autorizado' });
        return;
      }
      const dto: CreateExpenseDto = req.body;
      const expense = await ExpenseService.createExpense(userId, dto);
      res.status(201).json({ message: 'Gasto creado exitosamente', data: expense });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al crear el gasto' });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'No autorizado' });
        return;
      }

      const rawId = req.params.id;
      const idStr = Array.isArray(rawId) ? rawId[0] : rawId;
      const id = Number(idStr);

      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de gasto inválido' });
        return;
      }

      const dto: UpdateExpenseDto = req.body;
      const expense = await ExpenseService.updateExpense(id, userId, dto);
      res.json({ message: 'Gasto actualizado exitosamente', data: expense });
    } catch (error: any) {
      const status = error.message.includes('no encontrado') ? 404 : 500;
      res.status(status).json({ error: error.message || 'Error al actualizar el gasto' });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'No autorizado' });
        return;
      }

      const rawId = req.params.id;
      const idStr = Array.isArray(rawId) ? rawId[0] : rawId;
      const id = Number(idStr);

      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de gasto inválido' });
        return;
      }

      await ExpenseService.deleteExpense(id, userId);
      res.json({ message: 'Gasto eliminado exitosamente' });
    } catch (error: any) {
      const status = error.message.includes('no encontrado') ? 404 : 500;
      res.status(status).json({ error: error.message || 'Error al eliminar el gasto' });
    }
  }
}