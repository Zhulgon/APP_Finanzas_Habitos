export type GamificationDimension = 'discipline' | 'finance' | 'learning';

export type UserRank = 'novato' | 'constante' | 'estratega' | 'maestro';
export type RewardHistorySource =
  | 'event'
  | 'mission'
  | 'achievement'
  | 'shop'
  | 'freeze'
  | 'system';

export interface DimensionXp {
  discipline: number;
  finance: number;
  learning: number;
}

export interface RewardHistoryEntry {
  id: string;
  createdAt: string;
  source: RewardHistorySource;
  reason: string;
  xpDelta: number;
  coinsDelta: number;
  dimension: GamificationDimension | 'system';
}

export interface UserProfile {
  name: string;
  objective: string;
  monthlyIncome: number;
  monthlySavingsGoal: number;
  currency: string;
  xp: number;
  level: number;
  rank: UserRank;
  xpByDimension: DimensionXp;
  coins: number;
  streakFreezes: number;
  lastFreezeGrantMonth: string;
  missionDifficulty: 1 | 2 | 3;
  claimedMissionIds: string[];
  unlockedAchievementIds: string[];
  ownedAvatarItems: string[];
  rewardHistory: RewardHistoryEntry[];
  avatarColor: string;
  avatarItem: string;
}
