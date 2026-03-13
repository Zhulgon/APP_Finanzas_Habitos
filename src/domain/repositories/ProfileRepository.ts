import type {
  GamificationDimension,
  RewardHistorySource,
  UserProfile,
} from '../entities/Profile';

export interface UpdateProfileInput {
  name: string;
  objective: string;
  monthlyIncome: number;
  monthlySavingsGoal: number;
  currency: string;
  avatarColor: string;
  avatarItem: string;
}

export interface ApplyGamificationInput {
  totalXpDelta?: number;
  dimension?: GamificationDimension;
  dimensionXpDelta?: number;
  coinsDelta?: number;
  missionDifficulty?: 1 | 2 | 3;
  streakFreezesDelta?: number;
  lastFreezeGrantMonth?: string;
  claimedMissionId?: string;
  unlockedAchievementId?: string;
  unlockAvatarItem?: string;
  auditSource?: RewardHistorySource;
  auditReason?: string;
  auditCreatedAt?: string;
}

export interface ProfileRepository {
  getProfile(): Promise<UserProfile>;
  updateProfile(input: UpdateProfileInput): Promise<void>;
  addXp(delta: number): Promise<UserProfile>;
  applyGamification(input: ApplyGamificationInput): Promise<UserProfile>;
}
