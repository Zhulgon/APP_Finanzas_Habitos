import type {
  ProfileRepository,
  UpdateProfileInput,
} from '../../domain/repositories/ProfileRepository';
import type { UserProfile } from '../../domain/entities/Profile';
import { levelFromXp } from '../../application/services/gamification';
import { getDatabase } from '../database/database';

interface ProfileRow {
  name: string;
  objective: string;
  monthly_income: number;
  monthly_savings_goal?: number;
  currency: string;
  xp: number;
  level: number;
  avatar_color: string;
  avatar_item: string;
}

const mapProfile = (row: ProfileRow): UserProfile => ({
  name: row.name,
  objective: row.objective,
  monthlyIncome: row.monthly_income,
  monthlySavingsGoal: row.monthly_savings_goal ?? 0,
  currency: row.currency,
  xp: row.xp,
  level: row.level,
  avatarColor: row.avatar_color,
  avatarItem: row.avatar_item,
});

export class SQLiteProfileRepository implements ProfileRepository {
  async getProfile(): Promise<UserProfile> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<ProfileRow>(
      `
      SELECT
        name,
        objective,
        monthly_income,
        0 as monthly_savings_goal,
        currency,
        xp,
        level,
        avatar_color,
        avatar_item
      FROM user_profile
      WHERE id = 1
      `,
    );

    if (!row) {
      throw new Error('No existe perfil inicial.');
    }

    return mapProfile(row);
  }

  async updateProfile(input: UpdateProfileInput): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `
      UPDATE user_profile
      SET name = ?,
          objective = ?,
          monthly_income = ?,
          currency = ?,
          avatar_color = ?,
          avatar_item = ?
      WHERE id = 1
      `,
      input.name.trim(),
      input.objective.trim(),
      input.monthlyIncome,
      input.currency.trim().toUpperCase() || 'COP',
      input.avatarColor,
      input.avatarItem,
    );
  }

  async addXp(delta: number): Promise<UserProfile> {
    const profile = await this.getProfile();
    const nextXp = profile.xp + Math.max(0, delta);
    const nextLevel = levelFromXp(nextXp);
    const db = await getDatabase();

    await db.runAsync(
      `
      UPDATE user_profile
      SET xp = ?, level = ?
      WHERE id = 1
      `,
      nextXp,
      nextLevel,
    );

    return {
      ...profile,
      xp: nextXp,
      level: nextLevel,
    };
  }
}
