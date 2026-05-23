import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RoutineCard } from '../components/RoutineCard';
import { WeekSchedule } from '../components/WeekSchedule';
import { useHistory } from '../hooks/useHistory';
import { useRoutines } from '../hooks/useRoutines';
import { todayKey } from '../lib/date';

function formatJP(date: string): string {
  const [, m, d] = date.split('-');
  return `${Number(m)}月${Number(d)}日`;
}

export function HomePage() {
  const { routines, moveRoutine } = useRoutines();
  const { history, toggleComplete } = useHistory();
  const [selectedDate, setSelectedDate] = useState<string>(todayKey());

  const today = todayKey();
  const isToday = selectedDate === today;
  const isFuture = selectedDate > today;
  const completedSet = new Set(history[selectedDate] ?? []);

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
        <ul className="card-list">
          {routines.map((r, i) => (
            <li key={r.id}>
              <RoutineCard
                routine={r}
                completed={completedSet.has(r.id)}
                onToggleComplete={(id) => {
                  if (isFuture) return;
                  toggleComplete(selectedDate, id);
                }}
                isFirst={i === 0}
                isLast={i === routines.length - 1}
                onMoveUp={(id) => moveRoutine(id, 'up')}
                onMoveDown={(id) => moveRoutine(id, 'down')}
              />
            </li>
          ))}
        </ul>
      )}

      <Link to="/add" className="fab" aria-label="ルーティンを追加">
        <Plus size={28} strokeWidth={2.5} />
      </Link>
    </div>
  );
}
