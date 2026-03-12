import type { UserProfile } from '../entities/Profile';

export interface UpdateProfileInput {
  name: string;
  objective: string;
  monthlyIncome: number;
  monthlySavingsGoal: number;
  currency: string;
  avatarColor: string;
  avatarItem: string;
}

export interface ProfileRepository {
  getProfile(): Promise<UserProfile>;
  updateProfile(input: UpdateProfileInput): Promise<void>;
  addXp(delta: number): Promise<UserProfile>;
}
