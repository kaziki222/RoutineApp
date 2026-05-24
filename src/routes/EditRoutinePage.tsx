import { ChevronLeft } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { RoutineForm } from '../components/RoutineForm';
import { useHistory } from '../hooks/useHistory';
import { useRoutines } from '../hooks/useRoutines';

export function EditRoutinePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { updateRoutine, removeRoutine, getRoutine } = useRoutines();
  const { removeRoutineFromHistory } = useHistory();

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
          timerSeconds: routine.timerSeconds ?? 0,
          kind: routine.kind,
          sectionId: routine.sectionId,
        }}
        onSubmit={(input) => {
          updateRoutine(id, input);
          navigate('/');
        }}
        onCancel={() => navigate('/')}
        onDelete={() => {
          removeRoutine(id);
          removeRoutineFromHistory(id);
          navigate('/');
        }}
      />
    </div>
  );
}
