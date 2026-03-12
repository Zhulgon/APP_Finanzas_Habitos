import { completeLessonUseCase } from '../../src/domain/use-cases/learning/completeLesson';
import {
  createLessonRepositoryMock,
  createProfileRepositoryMock,
} from '../helpers/repositoryMocks';

describe('completeLessonUseCase', () => {
  it('suma xp cuando una leccion se completa por primera vez', async () => {
    const addXpSpy = jest.fn(async () => ({
      name: '',
      objective: '',
      monthlyIncome: 0,
      monthlySavingsGoal: 0,
      currency: 'COP',
      xp: 15,
      level: 1,
      avatarColor: '#0f766e',
      avatarItem: 'seedling',
    }));
    const lessonRepository = createLessonRepositoryMock({
      markLessonCompleted: async () => true,
    });
    const profileRepository = createProfileRepositoryMock({
      addXp: addXpSpy,
    });

    const result = await completeLessonUseCase(
      { lessonRepository, profileRepository },
      'lesson_1',
    );

    expect(result).toBe(true);
    expect(addXpSpy).toHaveBeenCalledWith(15);
  });

  it('no suma xp si la leccion ya estaba completada', async () => {
    const addXpSpy = jest.fn();
    const lessonRepository = createLessonRepositoryMock({
      markLessonCompleted: async () => false,
    });
    const profileRepository = createProfileRepositoryMock({
      addXp: addXpSpy,
    });

    const result = await completeLessonUseCase(
      { lessonRepository, profileRepository },
      'lesson_1',
    );

    expect(result).toBe(false);
    expect(addXpSpy).not.toHaveBeenCalled();
  });
});
