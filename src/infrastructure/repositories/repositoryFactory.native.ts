import { initializeDatabase } from '../database/database';
import { SQLiteFinanceRepository } from './SQLiteFinanceRepository';
import { SQLiteHabitRepository } from './SQLiteHabitRepository';
import { SQLiteLessonRepository } from './SQLiteLessonRepository';
import { SQLiteProfileRepository } from './SQLiteProfileRepository';
import { NativeBackupRepository } from './native/NativeBackupRepository';
import type { RepositoryBundle } from './repositoryFactory.types';

export const createRepositoryBundle = (): RepositoryBundle => {
  return {
    initialize: initializeDatabase,
    habitRepository: new SQLiteHabitRepository(),
    financeRepository: new SQLiteFinanceRepository(),
    lessonRepository: new SQLiteLessonRepository(),
    profileRepository: new SQLiteProfileRepository(),
    backupRepository: new NativeBackupRepository(),
  };
};
