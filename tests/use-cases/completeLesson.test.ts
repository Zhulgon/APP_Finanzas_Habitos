import { completeLessonUseCase } from '../../src/domain/use-cases/learning/completeLesson';
import { createLessonRepositoryMock } from '../helpers/repositoryMocks';
import { InMemoryDomainEventBus } from '../../src/application/services/InMemoryDomainEventBus';

describe('completeLessonUseCase', () => {
  it('publica evento cuando una leccion se completa por primera vez', async () => {
    const lessonRepository = createLessonRepositoryMock({
      markLessonCompleted: async () => true,
    });
    const eventBus = new InMemoryDomainEventBus();
    const handler = jest.fn(async (_event: any) => {});
    eventBus.subscribe('lesson.completed', handler);

    const result = await completeLessonUseCase(
      { lessonRepository, eventBus },
      'lesson_1',
    );

    expect(result).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0]?.[0] as { payload: { lessonId: string } };
    expect(event.payload.lessonId).toBe('lesson_1');
  });

  it('no publica evento si la leccion ya estaba completada', async () => {
    const lessonRepository = createLessonRepositoryMock({
      markLessonCompleted: async () => false,
    });
    const eventBus = new InMemoryDomainEventBus();
    const handler = jest.fn(async (_event: any) => {});
    eventBus.subscribe('lesson.completed', handler);

    const result = await completeLessonUseCase(
      { lessonRepository, eventBus },
      'lesson_1',
    );

    expect(result).toBe(false);
    expect(handler).not.toHaveBeenCalled();
  });
});
