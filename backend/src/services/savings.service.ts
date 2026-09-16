import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ANNUAL_GOAL = 15000.00;

export class SavingsService {
  static async getSavingsByUser(userId: number) {
    // @ts-ignore
    const savings = await prisma.savings.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    const totalSavings = savings.reduce((acc: number, item: { amount: number }) => acc + item.amount, 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlySavings = savings
      .filter((item: { date: Date | string }) => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      })
      .reduce((acc: number, item: { amount: number }) => acc + item.amount, 0);

    const percentage = Math.min(Math.round((totalSavings / ANNUAL_GOAL) * 100), 100);

    return {
      savings,
      stats: {
        totalSavings,
        monthlySavings,
        annualGoal: ANNUAL_GOAL,
        percentage
      }
    };
  }

  static async createSaving(userId: number, data: { description: string; amount: number; category?: string; date?: string | Date }) {
    if (!data.description || data.amount === undefined) {
      throw new Error('La descripción y el monto son obligatorios');
    }

    // @ts-ignore
    return await prisma.savings.create({
      data: {
        userId,
        description: data.description,
        amount: Number(data.amount),
        category: data.category || 'Fondo de Ahorro',
        date: data.date ? new Date(data.date) : new Date()
      }
    });
  }
}