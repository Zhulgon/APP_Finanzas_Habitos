import { levelFromXp } from '../../../application/services/gamification';
import type { UserProfile } from '../../../domain/entities/Profile';
import type {
  ProfileRepository,
  UpdateProfileInput,
} from '../../../domain/repositories/ProfileRepository';
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
        },
      };
    });
    return nextState.profile;
  }
}
