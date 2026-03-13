export const MIGRATIONS: string[] = [
  `
  CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    frequency TEXT NOT NULL,
    target_per_week INTEGER NOT NULL,
    category TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    FOREIGN KEY (habit_id) REFERENCES habits(id)
  );

  CREATE TABLE IF NOT EXISTS incomes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    recorded_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT NOT NULL,
    note TEXT,
    recorded_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month_key TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    UNIQUE(month_key, category)
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    estimated_minutes INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS lesson_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id TEXT NOT NULL UNIQUE,
    completed_at TEXT NOT NULL,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
  );

  CREATE TABLE IF NOT EXISTS weekly_plan (
    week_key TEXT PRIMARY KEY NOT NULL,
    habit_target INTEGER NOT NULL DEFAULT 0,
    savings_target REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    objective TEXT NOT NULL,
    monthly_income REAL NOT NULL,
    currency TEXT NOT NULL,
    xp INTEGER NOT NULL,
    level INTEGER NOT NULL,
    avatar_color TEXT NOT NULL,
    avatar_item TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_habit_logs_completed_at ON habit_logs(completed_at);
  CREATE INDEX IF NOT EXISTS idx_expenses_month_category ON expenses(recorded_at, category);
  CREATE INDEX IF NOT EXISTS idx_budgets_month_category ON budgets(month_key, category);
  CREATE INDEX IF NOT EXISTS idx_weekly_plan_week_key ON weekly_plan(week_key);
  `,
];
