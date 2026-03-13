export type WeeklyPlanStatus = 'unplanned' | 'at_risk' | 'on_track' | 'achieved';

export interface WeeklyPlan {
  weekKey: string;
  habitTarget: number;
  savingsTarget: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyPlanProgress {
  weekKey: string;
  dateFrom: string;
  dateTo: string;
  habitTarget: number;
  completedHabits: number;
  habitProgressRate: number;
  savingsTarget: number;
  currentSavings: number;
  savingsProgressRate: number;
  status: WeeklyPlanStatus;
}
