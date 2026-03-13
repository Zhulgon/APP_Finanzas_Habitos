class MemoryStorage {
  private readonly data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}

const originalLocalStorage = (globalThis as { localStorage?: unknown }).localStorage;

const installLocalStorage = () => {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    writable: true,
    configurable: true,
  });
  return storage;
};

describe('app v1 smoke flow', () => {
  afterEach(() => {
    jest.resetModules();
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  it('ejecuta onboarding, operaciones base y persistencia tras recarga', async () => {
    const storage = installLocalStorage();
    storage.clear();

    const { useAppStore } = await import('../../src/application/stores/useAppStore');

    await useAppStore.getState().bootstrap();
    expect(useAppStore.getState().profile?.name ?? '').toBe('');

    await useAppStore.getState().finishOnboarding({
      name: 'Usuario V1',
      objective: 'Consistencia y control financiero',
      monthlyIncome: 4500000,
      monthlySavingsGoal: 900000,
      currency: 'COP',
      initialHabits: ['Caminar 20 min'],
    });

    const habitId = useAppStore.getState().habits[0]?.id;
    expect(habitId).toBeTruthy();

    const completedFirst = await useAppStore.getState().completeHabit(habitId!);
    const completedSecond = await useAppStore.getState().completeHabit(habitId!);
    expect(completedFirst).toBe(true);
    expect(completedSecond).toBe(false);

    await useAppStore.getState().addIncome(4500000);
    await useAppStore
      .getState()
      .addExpense(250000, 'fixed', 'Arriendo', 'Pago mensual');
    await useAppStore.getState().setMonthlyBudget('fixed', 1500000);

    const lessonId = useAppStore.getState().lessons[0]?.id;
    expect(lessonId).toBeTruthy();
    const lessonFirst = await useAppStore.getState().completeLesson(lessonId!);
    const lessonSecond = await useAppStore.getState().completeLesson(lessonId!);
    expect(lessonFirst).toBe(true);
    expect(lessonSecond).toBe(false);

    const summary = useAppStore.getState().financeSummary;
    expect(summary.income).toBe(4500000);
    expect(summary.expenses).toBe(250000);
    expect(useAppStore.getState().profile?.xp ?? 0).toBeGreaterThan(0);
    expect(useAppStore.getState().profile?.rewardHistory.length ?? 0).toBeGreaterThan(0);

    for (
      let attempt = 0;
      attempt < 20 && (useAppStore.getState().profile?.coins ?? 0) < 15;
      attempt += 1
    ) {
      await useAppStore.getState().addIncome(1000 + attempt);
    }

    const coinsBeforePurchase = useAppStore.getState().profile?.coins ?? 0;
    expect(coinsBeforePurchase).toBeGreaterThanOrEqual(15);
    const wasBookPurchased = await useAppStore.getState().buyAvatarItem('book', 15);
    expect(wasBookPurchased).toBe(true);
    await useAppStore.getState().updateAvatar('#2563eb', 'book');
    expect(useAppStore.getState().profile?.ownedAvatarItems.includes('book')).toBe(
      true,
    );
    expect(useAppStore.getState().profile?.avatarItem).toBe('book');

    const freezesBeforeUse = useAppStore.getState().profile?.streakFreezes ?? 0;
    const freezeResult = await useAppStore.getState().useStreakFreeze();
    expect(freezeResult.ok).toBe(true);
    expect(useAppStore.getState().profile?.streakFreezes ?? 0).toBe(
      freezesBeforeUse - 1,
    );

    const backup = await useAppStore.getState().exportBackup();

    await useAppStore.getState().updateProfile({
      name: 'Temporal',
      objective: 'Temporal',
      monthlyIncome: 1,
      monthlySavingsGoal: 0,
      currency: 'COP',
      avatarColor: '#0f766e',
      avatarItem: 'seedling',
    });
    expect(useAppStore.getState().profile?.name).toBe('Temporal');

    await useAppStore.getState().importBackup(backup);
    expect(useAppStore.getState().profile?.name).toBe('Usuario V1');

    jest.resetModules();
    const { useAppStore: reloadedStore } = await import(
      '../../src/application/stores/useAppStore'
    );
    await reloadedStore.getState().bootstrap();

    expect(reloadedStore.getState().profile?.name).toBe('Usuario V1');
    expect(reloadedStore.getState().habits.length).toBeGreaterThan(0);
    expect(reloadedStore.getState().recentExpenses.length).toBeGreaterThan(0);
    expect(reloadedStore.getState().profile?.avatarItem).toBe('book');
  });
});
