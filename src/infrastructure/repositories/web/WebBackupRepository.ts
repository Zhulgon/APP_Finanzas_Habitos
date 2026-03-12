import { z } from 'zod';
import type { BackupRepository } from '../../../domain/repositories/BackupRepository';
import { readWebState, replaceWebState } from './storage';

const categorySchema = z.enum(['fixed', 'variable', 'services']);
const habitFrequencySchema = z.enum(['daily', 'weekly']);
const habitCategorySchema = z.enum(['health', 'productivity', 'finance']);

const backupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string().datetime(),
  data: z.object({
    profile: z.object({
      name: z.string(),
      objective: z.string(),
      monthlyIncome: z.number(),
      monthlySavingsGoal: z.number().nonnegative().optional().default(0),
      currency: z.string(),
      xp: z.number().int().nonnegative(),
      level: z.number().int().positive(),
      avatarColor: z.string(),
      avatarItem: z.string(),
    }),
    habits: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        frequency: habitFrequencySchema,
        targetPerWeek: z.number().int().nonnegative(),
        category: habitCategorySchema,
        isActive: z.boolean(),
        createdAt: z.string(),
      }),
    ),
    habitLogs: z.array(
      z.object({
        habitId: z.string(),
        completedAt: z.string(),
      }),
    ),
    incomes: z.array(
      z.object({
        id: z.number().int().positive(),
        amount: z.number(),
        type: z.enum(['salary', 'extra']),
        recordedAt: z.string(),
      }),
    ),
    expenses: z.array(
      z.object({
        id: z.number().int().positive(),
        amount: z.number(),
        category: categorySchema,
        subCategory: z.string(),
        note: z.string().optional(),
        recordedAt: z.string(),
      }),
    ),
    budgets: z.array(
      z.object({
        monthKey: z.string(),
        category: categorySchema,
        amount: z.number().nonnegative(),
      }),
    ),
    lessonProgress: z.array(
      z.object({
        lessonId: z.string(),
        completedAt: z.string(),
      }),
    ),
    counters: z.object({
      incomeId: z.number().int().positive(),
      expenseId: z.number().int().positive(),
    }),
  }),
});

export class WebBackupRepository implements BackupRepository {
  async exportBackup(): Promise<string> {
    const payload = {
      version: 1 as const,
      exportedAt: new Date().toISOString(),
      data: readWebState(),
    };
    return JSON.stringify(payload, null, 2);
  }

  async importBackup(serializedBackup: string): Promise<void> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(serializedBackup);
    } catch {
      throw new Error('El texto no es un JSON valido.');
    }

    const result = backupSchema.safeParse(parsed);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Estructura de backup invalida.';
      throw new Error(message);
    }

    replaceWebState(result.data.data);
  }
}
