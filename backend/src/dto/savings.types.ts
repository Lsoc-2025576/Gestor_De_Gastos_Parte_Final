export interface Saving {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string | Date;
  createdAt?: Date;
}

export interface CreateSavingDto {
  description: string;
  amount: number;
  category?: string;
  date?: string | Date;
}