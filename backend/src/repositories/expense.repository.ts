import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';
import type { ExpenseCategory } from '@prisma/client';

export interface ExpenseCreateInput {
  name: string;
  amount: number;
  category: ExpenseCategory;
  date?: Date;
  description?: string | null;
  userId: number;
}

export interface ExpenseUpdateInput {
  name?: string;
  amount?: number;
  category?: ExpenseCategory;
  date?: Date;
  description?: string | null;
}

export class ExpenseRepository {
  static async findAllByUser(userId: number) {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    return expenses.map((exp: any) => ({
      ...exp,
      amount: Number(exp.amount)
    }));
  }

  static async create(data: ExpenseCreateInput) {
    const expense = await prisma.expense.create({
      data: {
        name: data.name,
        amount: new Prisma.Decimal(data.amount),
        category: data.category,
        ...(data.date ? { date: data.date } : {}),
        description: data.description ?? null,
        userId: data.userId
      }
    });

    return {
      ...expense,
      amount: Number(expense.amount)
    };
  }

  static async update(id: number, userId: number, data: ExpenseUpdateInput) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.amount !== undefined) updateData.amount = new Prisma.Decimal(data.amount);
    if (data.category !== undefined) updateData.category = data.category;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.description !== undefined) updateData.description = data.description ?? null;

    const expense = await prisma.expense.update({
      where: { id, userId },
      data: updateData
    });

    return {
      ...expense,
      amount: Number(expense.amount)
    };
  }

  static async delete(id: number, userId: number) {
    return await prisma.expense.delete({
      where: { id, userId }
    });
  }

  static async getSummary(userId: number) {
    const expenses = await prisma.expense.findMany({
      where: { userId }
    });

    let total = 0;
    let arriendo = 0;
    let servicios = 0;
    let otros = 0;

    expenses.forEach((exp: any) => {
      const amt = Number(exp.amount);
      total += amt;
      if (exp.category === 'ARRIENDO') arriendo += amt;
      else if (exp.category === 'SERVICIOS') servicios += amt;
      else if (exp.category === 'OTROS') otros += amt;
    });

    return { total, arriendo, servicios, otros };
  }
}