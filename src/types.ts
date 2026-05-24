export type RoutineKind = 'routine' | 'task';

export type Routine = {
  id: string;
  title: string;
  description: string;
  url: string;
  timerSeconds?: number; // 0 or undefined = no timer
  kind: RoutineKind; // 'routine' = daily, 'task' = single-day
  taskDate?: string; // 'YYYY-MM-DD' — only set when kind === 'task'
  sectionId: string;
  createdAt: string;
};

export type Section = {
  id: string;
  title: string;
};

// date -> completed routine IDs
export type CompletionHistory = Record<string, string[]>;
// date -> skipped routine IDs
export type SkipHistory = Record<string, string[]>;
// date -> { routineId -> seconds } per-day timer duration override
export type TimerOverrides = Record<string, Record<string, number>>;

export type RoutineInput = {
  title: string;
  description: string;
  url: string;
  timerSeconds: number;
  kind: RoutineKind;
  sectionId: string;
};
