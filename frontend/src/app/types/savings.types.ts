export interface Saving {
  id: number;
  userId: number;
  description: string;
  amount: number;
  category: string;
  date: string | Date;
  createdAt?: string | Date;
}

export interface SavingsStats {
  totalSavings: number;
  monthlySavings: number;
  annualGoal: number;
  percentage: number;
}

export interface SavingsResponse {
  savings: Saving[];
  stats: SavingsStats;
}

export interface CreateSavingDto {
  description: string;
  amount: number;
  category?: string;
  date?: string | Date;
}