import { PrismaClient, type Expense, ExpenseCategory } from '@prisma/client';
import type { CreateExpenseDto, UpdateExpenseDto } from '../dto/expense.dto.js';

const prisma = new PrismaClient();

export interface ExpenseResponse {
  id: number;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}

function toExpenseResponse(expense: Expense & { amount: any }): ExpenseResponse {
  return {
    ...expense,
    amount: Number(expense.amount),
  };
}

export class ExpenseRepository {
  static async findAllByUserId(userId: number): Promise<ExpenseResponse[]> {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return expenses.map(toExpenseResponse);
  }

  static async findById(id: number, userId: number): Promise<ExpenseResponse | null> {
    const expense = await prisma.expense.findFirst({
      where: { id, userId },
    });
    return expense ? toExpenseResponse(expense) : null;
  }

  static async create(userId: number, data: CreateExpenseDto): Promise<ExpenseResponse> {
    const expense = await prisma.expense.create({
      data: {
        name: data.name,
        amount: data.amount,
        category: data.category ?? ExpenseCategory.OTROS,
        date: data.date ? new Date(data.date) : new Date(),
        description: data.description ?? null,
        userId,
      },
    });
    return toExpenseResponse(expense);
  }

  static async update(id: number, userId: number, data: UpdateExpenseDto): Promise<ExpenseResponse> {
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.category && { category: data.category }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.description !== undefined && { description: data.description ?? null }),
      },
    });
    return toExpenseResponse(expense);
  }

  static async delete(id: number, userId: number): Promise<void> {
    await prisma.expense.delete({
      where: { id },
    });
  }

  static async getSummary(userId: number) {
    const expenses = await prisma.expense.findMany({
      where: { userId },
    });

    const total = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const porCategoria = expenses.reduce((acc: Record<string, number>, curr) => {
      const cat = curr.category;
      acc[cat] = (acc[cat] || 0) + Number(curr.amount);
      return acc;
    }, {});

    return {
      total,
      porCategoria,
    };
  }
}