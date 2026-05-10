export type Routine = {
  id: string;
  title: string;
  description: string;
  url: string;
  createdAt: string;
};

export type DailyState = {
  date: string;
  completedRoutineIds: string[];
};

export type RoutineInput = Pick<Routine, 'title' | 'description' | 'url'>;
