export type Routine = {
  id: string;
  title: string;
  description: string;
  url: string;
  timerSeconds?: number; // 0 or undefined = no timer
  createdAt: string;
};

export type CompletionHistory = Record<string, string[]>;

export type RoutineInput = {
  title: string;
  description: string;
  url: string;
  timerSeconds: number; // form always supplies a number (0 = no timer)
};
