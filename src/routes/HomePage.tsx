import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { type TimerState } from '../components/RoutineCard';
import { SortableRoutineCard } from '../components/SortableRoutineCard';
import { WeekSchedule } from '../components/WeekSchedule';
import { useHistory } from '../hooks/useHistory';
import { useRoutines } from '../hooks/useRoutines';
import { useTimer } from '../hooks/useTimer';
import { todayKey } from '../lib/date';

function formatJP(date: string): string {
  const [, m, d] = date.split('-');
  return `${Number(m)}月${Number(d)}日`;
}

export function HomePage() {
  const { routines, reorderRoutines } = useRoutines();
  const { history, toggleComplete } = useHistory();
  const { activeTimer, remainingMs, startTimer, stopTimer } = useTimer();
  const [selectedDate, setSelectedDate] = useState<string>(todayKey());

  const today = todayKey();
  const isToday = selectedDate === today;
  const isFuture = selectedDate > today;
  const completedSet = new Set(history[selectedDate] ?? []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // require a small drag distance before activating so card buttons stay tappable
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      // long-press lightly to grab on touch devices; lets normal taps through
      activationConstraint: { delay: 180, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderRoutines(String(active.id), String(over.id));
  };

  return (
    <div className="page page--home">
      <h1 className="page__title">My Routine</h1>
      <WeekSchedule selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {!isToday && (
        <div className={`date-banner${isFuture ? ' date-banner--future' : ''}`}>
          <span>
            {formatJP(selectedDate)} を{isFuture ? '表示中（未来日は記録不可）' : '表示中'}
          </span>
          <button
            type="button"
            className="date-banner__reset"
            onClick={() => setSelectedDate(today)}
          >
            今日に戻る
          </button>
        </div>
      )}

      {routines.length === 0 ? (
        <div className="empty">
          <p>＋ボタンからルーティンを追加しましょう</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={routines.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="card-list">
              {routines.map((r) => {
                const isActiveTarget = activeTimer?.routineId === r.id;
                const isPaused =
                  isActiveTarget && typeof activeTimer?.pausedRemainingMs === 'number';
                const timerState: TimerState = !isActiveTarget
                  ? 'idle'
                  : activeTimer?.finished
                    ? 'finished'
                    : isPaused
                      ? 'paused'
                      : 'running';
                return (
                  <li key={r.id}>
                    <SortableRoutineCard
                      routine={r}
                      completed={completedSet.has(r.id)}
                      onToggleComplete={(id) => {
                        if (isFuture) return;
                        toggleComplete(selectedDate, id);
                      }}
                      timerState={timerState}
                      timerRemainingMs={
                        isActiveTarget ? remainingMs : (r.timerSeconds ?? 0) * 1000
                      }
                      onStartTimer={startTimer}
                      onStopTimer={stopTimer}
                    />
                  </li>
                );
              })}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <Link to="/add" className="fab" aria-label="ルーティンを追加">
        <Plus size={28} strokeWidth={2.5} />
      </Link>
    </div>
  );
}
