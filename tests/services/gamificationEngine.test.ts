import { InMemoryDomainEventBus } from '../../src/application/services/InMemoryDomainEventBus';
import { bindGamificationEngine } from '../../src/application/services/GamificationEngine';
import { createProfileRepositoryMock } from '../helpers/repositoryMocks';

describe('GamificationEngine', () => {
  it('aplica recompensa cuando recibe evento de habito completado', async () => {
    const applyGamificationSpy = jest.fn(async () => ({
      name: 'Test',
      objective: 'Objetivo',
      monthlyIncome: 0,
      monthlySavingsGoal: 0,
      currency: 'COP',
      xp: 12,
      level: 1,
      rank: 'novato' as const,
      xpByDimension: {
        discipline: 12,
        finance: 0,
        learning: 0,
      },
      coins: 2,
      streakFreezes: 1,
      lastFreezeGrantMonth: '',
      missionDifficulty: 2 as const,
      claimedMissionIds: [],
      unlockedAchievementIds: [],
      ownedAvatarItems: ['seedling'],
      rewardHistory: [],
      avatarColor: '#0f766e',
      avatarItem: 'seedling',
    }));

    const profileRepository = createProfileRepositoryMock({
      getProfile: async () => ({
        name: 'Test',
        objective: 'Objetivo',
        monthlyIncome: 0,
        monthlySavingsGoal: 0,
        currency: 'COP',
        xp: 0,
        level: 1,
        rank: 'novato',
        xpByDimension: {
          discipline: 0,
          finance: 0,
          learning: 0,
        },
        coins: 0,
        streakFreezes: 1,
        lastFreezeGrantMonth: '',
        missionDifficulty: 2,
        claimedMissionIds: [],
        unlockedAchievementIds: [],
        ownedAvatarItems: ['seedling'],
        rewardHistory: [],
        avatarColor: '#0f766e',
        avatarItem: 'seedling',
      }),
      applyGamification: applyGamificationSpy,
    });

    const bus = new InMemoryDomainEventBus();
    const unbind = bindGamificationEngine(bus, profileRepository);

    await bus.publish({
      id: 'evt_1',
      type: 'habit.completed',
      occurredAt: new Date().toISOString(),
      payload: {
        habitId: 'habit_1',
        completedAt: '2026-03-12',
      },
    });

    expect(applyGamificationSpy).toHaveBeenCalledTimes(1);
    expect(applyGamificationSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        dimension: 'discipline',
        auditSource: 'event',
      }),
    );

    unbind();
  });
});
