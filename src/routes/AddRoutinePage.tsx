import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { RoutineForm } from '../components/RoutineForm';
import { useRoutines } from '../hooks/useRoutines';

export function AddRoutinePage() {
  const navigate = useNavigate();
  const { addRoutine } = useRoutines();

  return (
    <div className="page page--form">
      <header className="page__header">
        <Link to="/" className="page__back" aria-label="戻る">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="page__title page__title--small">ルーティンを追加</h1>
      </header>
      <RoutineForm
        submitLabel="保存"
        onSubmit={(input) => {
          addRoutine(input);
          navigate('/');
        }}
        onCancel={() => navigate('/')}
      />
    </div>
  );
}
