import { Check, ChevronDown, ChevronUp, ExternalLink, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isSafeHttpUrl } from '../lib/youtube';
import type { Routine } from '../types';
import { YouTubeThumb } from './YouTubeThumb';

type Props = {
  routine: Routine;
  completed: boolean;
  onToggleComplete: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
};

export function RoutineCard({
  routine,
  completed,
  onToggleComplete,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: Props) {
  const safeUrl = isSafeHttpUrl(routine.url) ? routine.url : null;

  const openVideo = () => {
    if (safeUrl) window.open(safeUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <article className="card">
      <button
        type="button"
        className="card__thumb-btn"
        onClick={openVideo}
        disabled={!safeUrl}
        aria-label={safeUrl ? `${routine.title}の動画を開く` : '動画URL未設定'}
      >
        <YouTubeThumb url={routine.url} />
      </button>

      <div className="card__main">
        <header className="card__header">
          <h2 className="card__title">{routine.title || '(無題のルーティン)'}</h2>
          <div className="card__controls">
            <button
              type="button"
              className="card__reorder"
              onClick={() => onMoveUp(routine.id)}
              disabled={isFirst}
              aria-label={`${routine.title}を上に移動`}
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              className="card__reorder"
              onClick={() => onMoveDown(routine.id)}
              disabled={isLast}
              aria-label={`${routine.title}を下に移動`}
            >
              <ChevronDown size={18} />
            </button>
            <Link
              to={`/edit/${routine.id}`}
              className="card__edit"
              aria-label={`${routine.title}を編集`}
            >
              <Pencil size={18} />
            </Link>
          </div>
        </header>

        <footer className="card__footer">
          {safeUrl && (
            <button
              type="button"
              className="btn-link"
              onClick={openVideo}
              aria-label="動画URLを開く"
            >
              URLへ <ExternalLink size={12} strokeWidth={2.5} />
            </button>
          )}
          <button
            type="button"
            className={`btn-complete${completed ? ' btn-complete--done' : ''}`}
            onClick={() => onToggleComplete(routine.id)}
            aria-pressed={completed}
          >
            完了 <Check size={14} strokeWidth={3} />
          </button>
        </footer>
      </div>
    </article>
  );
}
