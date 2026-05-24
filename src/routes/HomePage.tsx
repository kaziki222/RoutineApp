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
import { FolderPlus, ListPlus, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionBlock } from '../components/SectionBlock';
import { SortableRoutineCard } from '../components/SortableRoutineCard';
import { WeekSchedule } from '../components/WeekSchedule';
import { computeDayRate, useHistory } from '../hooks/useHistory';
import { useRoutines } from '../hooks/useRoutines';
import { useSections } from '../hooks/useSections';
import { effectiveTimerSeconds, useTimer } from '../hooks/useTimer';
import { todayKey } from '../lib/date';
import type { TimerState } from '../components/RoutineCard';

function formatJP(date: string): string {
  const [, m, d] = date.split('-');
  return `${Number(m)}月${Number(d)}日`;
}

export function HomePage() {
  const navigate = useNavigate();
  const { routines, reorderRoutines } = useRoutines();
  const { sections, addSection, updateSection } = useSections();
  const { history, toggleComplete, toggleSkip, isCompleted, isSkipped } = useHistory();
  const { activeTimer, remainingMs, overrides, startTimer, stopTimer } = useTimer();
  const [selectedDate, setSelectedDate] = useState<string>(todayKey());
  const [fabOpen, setFabOpen] = useState(false);

  const today = todayKey();
  const isToday = selectedDate === today;
  const isFuture = selectedDate > today;

  // Visible items for the selected date: routines always, tasks only on their day.
  const visible = routines.filter(
    (r) => r.kind === 'routine' || (r.kind === 'task' && r.taskDate === selectedDate)
  );
  const visibleIds = visible.map((r) => r.id);
  const rate = computeDayRate(history, selectedDate, visibleIds);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (overId.startsWith('section:')) {
      reorderRoutines(activeId, null, overId.slice('section:'.length));
    } else if (activeId !== overId) {
      const overRoutine = routines.find((r) => r.id === overId);
      reorderRoutines(activeId, overId, overRoutine?.sectionId);
    }
  };

  const handleAddSection = () => {
    setFabOpen(false);
    const title = window.prompt('セクション名を入力');
    if (title && title.trim()) addSection(title.trim());
  };

  const timerStateFor = (id: string): TimerState => {
    if (activeTimer?.routineId !== id) return 'idle';
    if (activeTimer.finished) return 'finished';
    return typeof activeTimer.pausedRemainingMs === 'number' ? 'paused' : 'running';
  };

  return (
    <div className="page page--home">
      <h1 className="page__title">My Routine</h1>
      <WeekSchedule selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <div className="day-rate">
        <span className="day-rate__label">
          {isToday ? '今日' : formatJP(selectedDate)}の達成率
        </span>
        <span className="day-rate__value">{rate.percent}%</span>
        <span className="day-rate__count">
          {rate.completed}/{rate.total}
        </span>
      </div>

      {!isToday && (
        <div className={`date-banner${isFuture ? ' date-banner--future' : ''}`}>
          <span>{formatJP(selectedDate)} を表示中{isFuture ? '（未来日は記録不可）' : ''}</span>
          <button
            type="button"
            className="date-banner__reset"
            onClick={() => setSelectedDate(today)}
          >
            今日に戻る
          </button>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {sections.map((section) => {
          const cards = visible.filter((r) => r.sectionId === section.id);
          return (
            <SectionBlock
              key={section.id}
              section={section}
              count={cards.length}
              onRename={updateSection}
            >
              <SortableContext
                items={cards.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="card-list">
                  {cards.map((r) => {
                    const state = timerStateFor(r.id);
                    const baseSeconds = r.timerSeconds ?? 0;
                    const effSeconds = effectiveTimerSeconds(
                      overrides,
                      selectedDate,
                      r.id,
                      baseSeconds
                    );
                    const isActiveTarget = activeTimer?.routineId === r.id;
                    return (
                      <li key={r.id}>
                        <SortableRoutineCard
                          routine={{ ...r, timerSeconds: effSeconds }}
                          completed={isCompleted(selectedDate, r.id)}
                          skipped={isSkipped(selectedDate, r.id)}
                          onToggleComplete={(id) => {
                            if (isFuture) return;
                            toggleComplete(selectedDate, id);
                          }}
                          onToggleSkip={(id) => {
                            if (isFuture) return;
                            toggleSkip(selectedDate, id);
                          }}
                          timerState={state}
                          timerRemainingMs={isActiveTarget ? remainingMs : effSeconds * 1000}
                          onStartTimer={startTimer}
                          onStopTimer={stopTimer}
                        />
                      </li>
                    );
                  })}
                </ul>
              </SortableContext>
            </SectionBlock>
          );
        })}
      </DndContext>

      {fabOpen && (
        <button
          type="button"
          className="fab-backdrop"
          aria-label="メニューを閉じる"
          onClick={() => setFabOpen(false)}
        />
      )}
      <div className="fab-wrap">
        {fabOpen && (
          <div className="fab-menu" role="menu">
            <button
              type="button"
              className="fab-menu__item"
              onClick={() => {
                setFabOpen(false);
                navigate(`/add?date=${selectedDate}`);
              }}
            >
              <ListPlus size={18} /> ルーティン / タスクを追加
            </button>
            <button type="button" className="fab-menu__item" onClick={handleAddSection}>
              <FolderPlus size={18} /> セクションを追加
            </button>
          </div>
        )}
        <button
          type="button"
          className={`fab${fabOpen ? ' fab--open' : ''}`}
          aria-label={fabOpen ? 'メニューを閉じる' : '追加メニューを開く'}
          aria-expanded={fabOpen}
          onClick={() => setFabOpen((v) => !v)}
        >
          {fabOpen ? <X size={28} strokeWidth={2.5} /> : <Plus size={28} strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
}
