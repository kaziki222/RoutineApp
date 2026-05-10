import { ChevronLeft } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { RoutineForm } from '../components/RoutineForm';
import { useDailyState } from '../hooks/useDailyState';
import { useRoutines } from '../hooks/useRoutines';

export function EditRoutinePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { routines, updateRoutine, removeRoutine, getRoutine } = useRoutines();
  const { removeRoutineFromDaily } = useDailyState(routines.length);

  const routine = getRoutine(id);
  if (!routine) return <Navigate to="/" replace />;

  return (
    <div className="page page--form">
      <header className="page__header">
        <Link to="/" className="page__back" aria-label="戻る">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="page__title page__title--small">ルーティンを編集</h1>
      </header>
      <RoutineForm
        submitLabel="保存"
        defaultValues={{
          title: routine.title,
          description: routine.description,
          url: routine.url,
        }}
        onSubmit={(input) => {
          updateRoutine(id, input);
          navigate('/');
        }}
        onCancel={() => navigate('/')}
        onDelete={() => {
          removeRoutine(id);
          removeRoutineFromDaily(id);
          navigate('/');
        }}
      />
    </div>
  );
}
