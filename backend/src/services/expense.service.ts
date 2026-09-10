import { ExpenseRepository } from '../repositories/expense.repository.js';
import type { ExpenseCreateInput, ExpenseUpdateInput } from '../repositories/expense.repository.js';
import type { ExpenseCategory } from '@prisma/client';

export class ExpenseService {
  static async getAllExpenses(userId: number) {
    return await ExpenseRepository.findAllByUser(userId);
  }

  static async getSummary(userId: number) {
    return await ExpenseRepository.getSummary(userId);
  }

  static async createExpense(userId: number, data: { name: string; amount: number; category: ExpenseCategory; date?: string; description?: string }) {
    if (!data.name || data.amount <= 0 || !data.category) {
      throw new Error('Datos inválidos para el gasto');
    }

    const payload: ExpenseCreateInput = {
      name: data.name,
      amount: data.amount,
      category: data.category,
      ...(data.date ? { date: new Date(data.date) } : {}),
      description: data.description ?? null,
      userId
    };

    return await ExpenseRepository.create(payload);
  }

  static async updateExpense(id: number, userId: number, data: { name?: string; amount?: number; category?: ExpenseCategory; date?: string; description?: string }) {
    const payload: ExpenseUpdateInput = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.date ? { date: new Date(data.date) } : {}),
      ...(data.description !== undefined && { description: data.description ?? null })
    };

    return await ExpenseRepository.update(id, userId, payload);
  }

  static async deleteExpense(id: number, userId: number) {
    return await ExpenseRepository.delete(id, userId);
  }
}