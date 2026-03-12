import { WebBackupRepository } from './web/WebBackupRepository';
import { WebFinanceRepository } from './web/WebFinanceRepository';
import { WebHabitRepository } from './web/WebHabitRepository';
import { WebLessonRepository } from './web/WebLessonRepository';
import { WebProfileRepository } from './web/WebProfileRepository';
import type { RepositoryBundle } from './repositoryFactory.types';

export const createRepositoryBundle = (): RepositoryBundle => {
  return {
    initialize: async () => Promise.resolve(),
    habitRepository: new WebHabitRepository(),
    financeRepository: new WebFinanceRepository(),
    lessonRepository: new WebLessonRepository(),
    profileRepository: new WebProfileRepository(),
    backupRepository: new WebBackupRepository(),
  };
};
