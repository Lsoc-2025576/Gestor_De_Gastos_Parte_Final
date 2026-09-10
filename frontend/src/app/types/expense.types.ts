export type ExpenseCategory = 'ARRIENDO' | 'SERVICIOS' | 'OTROS';

export interface Expense {
  id: number;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: string | Date;
  description?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  userId: number;
}

export interface ExpenseCreateDto {
  name: string;
  amount: number;
  category: ExpenseCategory;
  date?: string;
  description?: string;
}

export interface ExpenseUpdateDto {
  name?: string;
  amount?: number;
  category?: ExpenseCategory;
  date?: string;
  description?: string;
}

export interface ExpenseSummary {
  total: number;
  arriendo: number;
  servicios: number;
  otros: number;
}