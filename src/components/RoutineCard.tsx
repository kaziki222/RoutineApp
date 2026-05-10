import { Check, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isSafeHttpUrl } from '../lib/youtube';
import type { Routine } from '../types';
import { YouTubeThumb } from './YouTubeThumb';

type Props = {
  routine: Routine;
  completed: boolean;
  onToggleComplete: (id: string) => void;
};

export function RoutineCard({ routine, completed, onToggleComplete }: Props) {
  const safeUrl = isSafeHttpUrl(routine.url) ? routine.url : null;

  const openVideo = () => {
    if (safeUrl) window.open(safeUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <article className="card">
      <header className="card__header">
        <h2 className="card__title">{routine.title || '(無題のルーティン)'}</h2>
        <Link
          to={`/edit/${routine.id}`}
          className="card__edit"
          aria-label={`${routine.title}を編集`}
        >
          <Pencil size={20} />
        </Link>
      </header>

      <div className="card__body">
        <button
          type="button"
          className="card__thumb-btn"
          onClick={openVideo}
          disabled={!safeUrl}
          aria-label={safeUrl ? `${routine.title}の動画を開く` : '動画URL未設定'}
        >
          <YouTubeThumb url={routine.url} />
        </button>
        <div className="card__text">
          {routine.description && <p className="card__desc">{routine.description}</p>}
          {safeUrl && (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card__url"
            >
              {routine.url}
            </a>
          )}
        </div>
      </div>

      <footer className="card__footer">
        <button
          type="button"
          className={`btn-complete${completed ? ' btn-complete--done' : ''}`}
          onClick={() => onToggleComplete(routine.id)}
          aria-pressed={completed}
        >
          完了 <Check size={16} strokeWidth={3} />
        </button>
      </footer>
    </article>
  );
}
