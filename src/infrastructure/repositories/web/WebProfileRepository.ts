import { levelFromXp, rankFromLevel } from '../../../application/services/gamification';
import type { UserProfile } from '../../../domain/entities/Profile';
import type {
  ApplyGamificationInput,
  ProfileRepository,
  UpdateProfileInput,
} from '../../../domain/repositories/ProfileRepository';
import { createId } from '../../../shared/utils/id';
import { readWebState, updateWebState } from './storage';

export class WebProfileRepository implements ProfileRepository {
  async getProfile(): Promise<UserProfile> {
    return readWebState().profile;
  }

  async updateProfile(input: UpdateProfileInput): Promise<void> {
    updateWebState((state) => ({
      ...state,
      profile: {
        ...state.profile,
        name: input.name.trim(),
        objective: input.objective.trim(),
        monthlyIncome: input.monthlyIncome,
        monthlySavingsGoal: input.monthlySavingsGoal,
        currency: input.currency.trim().toUpperCase() || 'COP',
        avatarColor: input.avatarColor,
        avatarItem: input.avatarItem,
      },
    }));
  }

  async addXp(delta: number): Promise<UserProfile> {
    const safeDelta = Math.max(0, delta);
    const nextState = updateWebState((state) => {
      const nextXp = state.profile.xp + safeDelta;
      return {
        ...state,
        profile: {
          ...state.profile,
          xp: nextXp,
          level: levelFromXp(nextXp),
          rank: rankFromLevel(levelFromXp(nextXp)),
        },
      };
    });
    return nextState.profile;
  }

  async applyGamification(input: ApplyGamificationInput): Promise<UserProfile> {
    const nextState = updateWebState((state) => {
      const current = state.profile;
      const dimension = input.dimension ?? 'discipline';
      const totalXpDelta = Math.max(0, input.totalXpDelta ?? 0);
      const dimensionXpDelta = Math.max(0, input.dimensionXpDelta ?? 0);
      const coinsDelta = input.coinsDelta ?? 0;
      const streakFreezesDelta = input.streakFreezesDelta ?? 0;
      const nextXp = current.xp + totalXpDelta;
      const nextLevel = levelFromXp(nextXp);

      const claimedMissionIds = new Set(current.claimedMissionIds);
      const unlockedAchievementIds = new Set(current.unlockedAchievementIds);
      if (input.claimedMissionId) {
        claimedMissionIds.add(input.claimedMissionId);
      }
      if (input.unlockedAchievementId) {
        unlockedAchievementIds.add(input.unlockedAchievementId);
      }
      const ownedAvatarItems = new Set(current.ownedAvatarItems);
      if (input.unlockAvatarItem) {
        ownedAvatarItems.add(input.unlockAvatarItem);
      }

      const shouldAppendAudit = Boolean(input.auditReason && input.auditSource);
      const auditDimension: UserProfile['rewardHistory'][number]['dimension'] =
        input.dimension ?? 'system';
      const nextRewardHistory: UserProfile['rewardHistory'] = shouldAppendAudit
        ? [
            {
              id: createId('reward'),
              createdAt: input.auditCreatedAt ?? new Date().toISOString(),
              source: input.auditSource!,
              reason: input.auditReason!,
              xpDelta: totalXpDelta,
              coinsDelta,
              dimension: auditDimension,
            },
            ...current.rewardHistory,
          ].slice(0, 120)
        : current.rewardHistory;

      return {
        ...state,
        profile: {
          ...current,
          xp: nextXp,
          level: nextLevel,
          rank: rankFromLevel(nextLevel),
          coins: Math.max(0, current.coins + coinsDelta),
          streakFreezes: Math.max(0, current.streakFreezes + streakFreezesDelta),
          lastFreezeGrantMonth:
            input.lastFreezeGrantMonth ?? current.lastFreezeGrantMonth,
          missionDifficulty: input.missionDifficulty ?? current.missionDifficulty,
          xpByDimension: {
            ...current.xpByDimension,
            [dimension]:
              current.xpByDimension[dimension] + dimensionXpDelta,
          },
          claimedMissionIds: Array.from(claimedMissionIds),
          unlockedAchievementIds: Array.from(unlockedAchievementIds),
          ownedAvatarItems: Array.from(ownedAvatarItems),
          rewardHistory: nextRewardHistory,
        },
      };
    });

    return nextState.profile;
  }
}
