import { Calendar } from '../components/Calendar';
import { useHistory } from '../hooks/useHistory';

export function StampCardPage() {
  const { stamps } = useHistory();

  return (
    <div className="page page--stamps">
      <h1 className="page__title">Stamp Card</h1>
      <Calendar stamps={stamps} />
    </div>
  );
}
