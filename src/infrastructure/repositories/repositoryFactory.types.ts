import type { BackupRepository } from '../../domain/repositories/BackupRepository';
import type { FinanceRepository } from '../../domain/repositories/FinanceRepository';
import type { HabitRepository } from '../../domain/repositories/HabitRepository';
import type { LessonRepository } from '../../domain/repositories/LessonRepository';
import type { ProfileRepository } from '../../domain/repositories/ProfileRepository';

export interface RepositoryBundle {
  initialize: () => Promise<void>;
  habitRepository: HabitRepository;
  financeRepository: FinanceRepository;
  lessonRepository: LessonRepository;
  profileRepository: ProfileRepository;
  backupRepository: BackupRepository;
}
