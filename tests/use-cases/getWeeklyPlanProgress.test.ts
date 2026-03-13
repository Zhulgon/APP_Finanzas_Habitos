import { getWeeklyPlanProgressUseCase } from '../../src/domain/use-cases/weekly-plan/getWeeklyPlanProgress';
import {
  createFinanceRepositoryMock,
  createHabitRepositoryMock,
  createWeeklyPlanRepositoryMock,
} from '../helpers/repositoryMocks';

describe('getWeeklyPlanProgressUseCase', () => {
  it('calcula progreso semanal y estado achieved', async () => {
    const weeklyPlanRepository = createWeeklyPlanRepositoryMock({
      getWeeklyPlan: async () => ({
        weekKey: '2026-W11',
        habitTarget: 6,
        savingsTarget: 200000,
        createdAt: '2026-03-10',
        updatedAt: '2026-03-10',
      }),
    });

    const habitRepository = createHabitRepositoryMock({
      countCompletionsByDateRange: async () => 7,
    });

    const financeRepository = createFinanceRepositoryMock({
      listIncomesByDateRange: async () => [
        { id: 1, amount: 500000, type: 'salary', recordedAt: '2026-03-10' },
      ],
      listExpensesByDateRange: async () => [
        {
          id: 1,
          amount: 200000,
          category: 'fixed',
          subCategory: 'arriendo',
          recordedAt: '2026-03-10',
        },
      ],
    });

    const result = await getWeeklyPlanProgressUseCase(
      {
        weeklyPlanRepository,
        habitRepository,
        financeRepository,
      },
      new Date('2026-03-12T12:00:00.000Z'),
    );

    expect(result.completedHabits).toBe(7);
    expect(result.currentSavings).toBe(300000);
    expect(result.status).toBe('achieved');
  });

  it('retorna unplanned cuando no hay metas configuradas', async () => {
    const weeklyPlanRepository = createWeeklyPlanRepositoryMock();
    const habitRepository = createHabitRepositoryMock();
    const financeRepository = createFinanceRepositoryMock();

    const result = await getWeeklyPlanProgressUseCase(
      {
        weeklyPlanRepository,
        habitRepository,
        financeRepository,
      },
      new Date('2026-03-12T12:00:00.000Z'),
    );

    expect(result.status).toBe('unplanned');
    expect(result.habitTarget).toBe(0);
    expect(result.savingsTarget).toBe(0);
  });
});
