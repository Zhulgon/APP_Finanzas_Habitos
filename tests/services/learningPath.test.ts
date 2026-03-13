import { buildLearningPath } from '../../src/application/services/learningPath';
import type { LessonWithStatus } from '../../src/domain/entities/Lesson';

const lesson = (
  id: string,
  dayOrder: number,
  completed = false,
  completedAt?: string,
): LessonWithStatus => ({
  id,
  title: id,
  summary: 'S',
  content: 'C',
  estimatedMinutes: 2,
  dayOrder,
  pillar: 'mindset',
  inspiredBy: 'test',
  completed,
  completedAt,
});

describe('learningPath', () => {
  it('solo habilita la primera leccion pendiente del dia', () => {
    const snapshot = buildLearningPath({
      lessons: [lesson('l1', 1, true, '2026-03-11'), lesson('l2', 2), lesson('l3', 3)],
      referenceDate: new Date('2026-03-12T10:00:00.000Z'),
    });

    expect(snapshot.completedLessons).toBe(1);
    expect(snapshot.availableToday).toBe(1);
    expect(snapshot.lessons[1].availableToday).toBe(true);
    expect(snapshot.lessons[2].availableToday).toBe(false);
  });

  it('bloquea nuevas lecciones cuando ya se completo la capsula diaria', () => {
    const snapshot = buildLearningPath({
      lessons: [lesson('l1', 1, true, '2026-03-12'), lesson('l2', 2)],
      referenceDate: new Date('2026-03-12T10:00:00.000Z'),
    });

    expect(snapshot.availableToday).toBe(0);
    expect(snapshot.nextUnlockDate).toBe('2026-03-13');
    expect(snapshot.lessons[1].lockedReason).toContain('Vuelve manana');
  });
});

