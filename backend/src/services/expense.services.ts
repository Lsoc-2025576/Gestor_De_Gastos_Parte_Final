import { ExpenseRepository, type ExpenseResponse } from '../repositories/expense.repository.js';
import type { CreateExpenseDto, UpdateExpenseDto } from '../dto/expense.dto.js';

export class ExpenseService {
  static async getAllExpenses(userId: number): Promise<{ expenses: ExpenseResponse[] }> {
    const expenses = await ExpenseRepository.findAllByUserId(userId);
    return { expenses };
  }

  static async createExpense(userId: number, data: CreateExpenseDto): Promise<ExpenseResponse> {
    return await ExpenseRepository.create(userId, data);
  }

  static async updateExpense(id: number, userId: number, data: UpdateExpenseDto): Promise<ExpenseResponse> {
    const existing = await ExpenseRepository.findById(id, userId);
    if (!existing) {
      throw new Error('Gasto no encontrado o no autorizado');
    }
    return await ExpenseRepository.update(id, userId, data);
  }

  static async deleteExpense(id: number, userId: number): Promise<void> {
    const existing = await ExpenseRepository.findById(id, userId);
    if (!existing) {
      throw new Error('Gasto no encontrado o no autorizado');
    }
    await ExpenseRepository.delete(id, userId);
  }

  static async getSummary(userId: number) {
    return await ExpenseRepository.getSummary(userId);
  }
}