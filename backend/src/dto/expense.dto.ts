import { ExpenseCategory } from '@prisma/client';

export interface CreateExpenseDto {
  name: string;
  amount: number;
  category?: ExpenseCategory;
  date?: string | Date;
  description?: string | null;
}

export interface UpdateExpenseDto {
  name?: string;
  amount?: number;
  category?: ExpenseCategory;
  date?: string | Date;
  description?: string | null;
}