import { completeHabitUseCase } from '../../src/domain/use-cases/habits/completeHabit';
import {
  createHabitRepositoryMock,
  createProfileRepositoryMock,
} from '../helpers/repositoryMocks';

describe('completeHabitUseCase', () => {
  it('asigna xp cuando la marcacion fue insertada', async () => {
    const addXpSpy = jest.fn(async () => ({
      name: '',
      objective: '',
      monthlyIncome: 0,
      monthlySavingsGoal: 0,
      currency: 'COP',
      xp: 10,
      level: 1,
      avatarColor: '#0f766e',
      avatarItem: 'seedling',
    }));
    const habitRepository = createHabitRepositoryMock({
      logCompletion: async () => true,
    });
    const profileRepository = createProfileRepositoryMock({
      addXp: addXpSpy,
    });

    const result = await completeHabitUseCase(
      { habitRepository, profileRepository },
      'habit_1',
      new Date('2026-03-12T10:00:00.000Z'),
    );

    expect(result).toBe(true);
    expect(addXpSpy).toHaveBeenCalledWith(10);
  });

  it('no asigna xp cuando ya estaba completado', async () => {
    const addXpSpy = jest.fn();
    const habitRepository = createHabitRepositoryMock({
      logCompletion: async () => false,
    });
    const profileRepository = createProfileRepositoryMock({
      addXp: addXpSpy,
    });

    const result = await completeHabitUseCase(
      { habitRepository, profileRepository },
      'habit_1',
      new Date('2026-03-12T10:00:00.000Z'),
    );

    expect(result).toBe(false);
    expect(addXpSpy).not.toHaveBeenCalled();
  });
});
