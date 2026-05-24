import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { RoutineForm } from '../components/RoutineForm';
import { useRoutines } from '../hooks/useRoutines';
import { todayKey } from '../lib/date';

export function AddRoutinePage() {
  const navigate = useNavigate();
  const { addRoutine } = useRoutines();
  const [params] = useSearchParams();
  const targetDate = params.get('date') || todayKey();

  return (
    <div className="page page--form">
      <header className="page__header">
        <Link to="/" className="page__back" aria-label="戻る">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="page__title page__title--small">追加</h1>
      </header>
      <RoutineForm
        submitLabel="保存"
        onSubmit={(input) => {
          addRoutine(input, targetDate);
          navigate('/');
        }}
        onCancel={() => navigate('/')}
      />
    </div>
  );
}
