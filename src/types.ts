export type Routine = {
  id: string;
  title: string;
  description: string;
  url: string;
  createdAt: string;
};

export type CompletionHistory = Record<string, string[]>;

export type RoutineInput = Pick<Routine, 'title' | 'description' | 'url'>;
