import { completeHabitUseCase } from '../../src/domain/use-cases/habits/completeHabit';
import { createHabitRepositoryMock } from '../helpers/repositoryMocks';
import { InMemoryDomainEventBus } from '../../src/application/services/InMemoryDomainEventBus';

describe('completeHabitUseCase', () => {
  it('publica evento cuando la marcacion fue insertada', async () => {
    const habitRepository = createHabitRepositoryMock({
      logCompletion: async () => true,
    });
    const eventBus = new InMemoryDomainEventBus();
    const handler = jest.fn(async (_event: any) => {});
    eventBus.subscribe('habit.completed', handler);

    const result = await completeHabitUseCase(
      { habitRepository, eventBus },
      'habit_1',
      new Date('2026-03-12T10:00:00.000Z'),
    );

    expect(result).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0]?.[0] as { payload: { habitId: string } };
    expect(event.payload.habitId).toBe('habit_1');
  });

  it('no publica evento cuando ya estaba completado', async () => {
    const habitRepository = createHabitRepositoryMock({
      logCompletion: async () => false,
    });
    const eventBus = new InMemoryDomainEventBus();
    const handler = jest.fn(async (_event: any) => {});
    eventBus.subscribe('habit.completed', handler);

    const result = await completeHabitUseCase(
      { habitRepository, eventBus },
      'habit_1',
      new Date('2026-03-12T10:00:00.000Z'),
    );

    expect(result).toBe(false);
    expect(handler).not.toHaveBeenCalled();
  });
});
