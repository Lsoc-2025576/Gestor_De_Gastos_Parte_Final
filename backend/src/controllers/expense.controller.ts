import type { Request, Response } from 'express';
import { ExpenseService } from '../services/expense.service.js';

export class ExpenseController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const expenses = await ExpenseService.getAllExpenses(userId);
      res.json({ status: 'success', data: { expenses } });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message || 'Error al obtener gastos' });
    }
  }

  static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const summary = await ExpenseService.getSummary(userId);
      res.json({ status: 'success', data: { summary } });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message || 'Error al obtener resumen de gastos' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const expense = await ExpenseService.createExpense(userId, req.body);
      res.status(201).json({ status: 'success', data: { expense } });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message || 'Error al crear gasto' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const paramId = req.params['id'];
      const rawId = Array.isArray(paramId) ? paramId[0] : paramId;
      const id = parseInt(rawId ?? '', 10);

      if (isNaN(id)) {
        res.status(400).json({ status: 'error', message: 'ID de gasto inválido' });
        return;
      }

      const expense = await ExpenseService.updateExpense(id, userId, req.body);
      res.json({ status: 'success', data: { expense } });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message || 'Error al actualizar gasto' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const paramId = req.params['id'];
      const rawId = Array.isArray(paramId) ? paramId[0] : paramId;
      const id = parseInt(rawId ?? '', 10);

      if (isNaN(id)) {
        res.status(400).json({ status: 'error', message: 'ID de gasto inválido' });
        return;
      }

      await ExpenseService.deleteExpense(id, userId);
      res.json({ status: 'success', message: 'Gasto eliminado correctamente' });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message || 'Error al eliminar gasto' });
    }
  }
}