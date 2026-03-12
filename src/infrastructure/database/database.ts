import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { MIGRATIONS } from './migrations';
import { seedLessonsIfNeeded, seedProfileIfNeeded } from './seed';

let dbPromise: Promise<SQLiteDatabase> | null = null;
let initialized = false;

export const getDatabase = async (): Promise<SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync('personal_growth.db');
  }
  return dbPromise;
};

export const initializeDatabase = async (): Promise<void> => {
  if (initialized) {
    return;
  }

  const db = await getDatabase();
  await db.execAsync('PRAGMA foreign_keys = ON;');

  for (const migration of MIGRATIONS) {
    await db.execAsync(migration);
  }

  await seedProfileIfNeeded(db);
  await seedLessonsIfNeeded(db);
  initialized = true;
};
