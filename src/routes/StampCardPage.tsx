import { Calendar } from '../components/Calendar';
import { useDailyState } from '../hooks/useDailyState';
import { useRoutines } from '../hooks/useRoutines';

export function StampCardPage() {
  const { routines } = useRoutines();
  const { stamps } = useDailyState(routines.length);

  return (
    <div className="page page--stamps">
      <h1 className="page__title">スタンプカード</h1>
      <Calendar stamps={stamps} />
    </div>
  );
}
