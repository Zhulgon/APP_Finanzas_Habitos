export type XpAction =
  | 'habit_completion'
  | 'expense_logged'
  | 'income_logged'
  | 'lesson_completed';

const XP_RULES: Record<XpAction, number> = {
  habit_completion: 10,
  expense_logged: 5,
  income_logged: 5,
  lesson_completed: 15,
};

export const xpForAction = (action: XpAction): number => XP_RULES[action];

export const levelFromXp = (xp: number): number => {
  return Math.floor(xp / 100) + 1;
};
