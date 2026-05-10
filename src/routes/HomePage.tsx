import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RoutineCard } from '../components/RoutineCard';
import { WeekSchedule } from '../components/WeekSchedule';
import { useDailyState } from '../hooks/useDailyState';
import { useRoutines } from '../hooks/useRoutines';

export function HomePage() {
  const { routines } = useRoutines();
  const { daily, toggleComplete } = useDailyState(routines.length);
  const completedSet = new Set(daily.completedRoutineIds);

  return (
    <div className="page page--home">
      <h1 className="page__title">My Routine</h1>
      <WeekSchedule />

      {routines.length === 0 ? (
        <div className="empty">
          <p>＋ボタンからルーティンを追加しましょう</p>
        </div>
      ) : (
        <ul className="card-list">
          {routines.map((r) => (
            <li key={r.id}>
              <RoutineCard
                routine={r}
                completed={completedSet.has(r.id)}
                onToggleComplete={toggleComplete}
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
