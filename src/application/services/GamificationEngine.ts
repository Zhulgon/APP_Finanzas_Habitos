import type { AppDomainEvent } from '../../domain/events/AppDomainEvent';
import type { DomainEventBus } from '../../domain/events/DomainEventBus';
import type { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { buildGamificationReward } from './gamification';

const processEventReward = async (
  profileRepository: ProfileRepository,
  event: AppDomainEvent,
): Promise<void> => {
  const profile = await profileRepository.getProfile();
  const reward = buildGamificationReward(event, profile.missionDifficulty);

  await profileRepository.applyGamification({
    totalXpDelta: reward.xp,
    dimension: reward.dimension,
    dimensionXpDelta: reward.xp,
    coinsDelta: reward.coins,
  });
};

export const bindGamificationEngine = (
  eventBus: DomainEventBus,
  profileRepository: ProfileRepository,
): (() => void) => {
  const unsubscribers = [
    eventBus.subscribe('habit.completed', async (event) => {
      await processEventReward(profileRepository, event);
    }),
    eventBus.subscribe('finance.expense_logged', async (event) => {
      await processEventReward(profileRepository, event);
    }),
    eventBus.subscribe('finance.income_logged', async (event) => {
      await processEventReward(profileRepository, event);
    }),
    eventBus.subscribe('lesson.completed', async (event) => {
      await processEventReward(profileRepository, event);
    }),
  ];

  return () => {
    for (const unsubscribe of unsubscribers) {
      unsubscribe();
    }
  };
};

