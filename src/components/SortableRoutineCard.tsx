import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RoutineCard, type TimerState } from './RoutineCard';
import type { Routine } from '../types';

type Props = {
  routine: Routine;
  completed: boolean;
  skipped: boolean;
  onToggleComplete: (id: string) => void;
  onToggleSkip: (id: string) => void;
  timerState: TimerState;
  timerRemainingMs: number;
  onStartTimer: (id: string, seconds: number) => void;
  onStopTimer: () => void;
};

export function SortableRoutineCard(props: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.routine.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 5 : undefined,
    opacity: isDragging ? 0.85 : undefined,
  };

  return (
    <RoutineCard
      {...props}
      setNodeRef={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      isDragging={isDragging}
    />
  );
}
