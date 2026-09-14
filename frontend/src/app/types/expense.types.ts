export type ExpenseCategory = 'SERVICIOS' | 'TRANSPORTE' | 'SUPER_MERCADO' | 'OTROS';

export interface Expense {
  id: number;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface ExpenseResponse {
  expenses: Expense[];
}

export interface ExpenseSummaryResponse {
  total: number;
  porCategoria: Record<string, number>;
}

export interface CreateExpenseDto {
  name: string;
  amount: number;
  category?: ExpenseCategory;
  date?: string;
  description?: string | null;
}