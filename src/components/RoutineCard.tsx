import { Check, GripVertical, Pause, Pencil, Play, X } from 'lucide-react';
import { type CSSProperties, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatRemaining } from '../hooks/useTimer';
import { isSafeHttpUrl } from '../lib/youtube';
import type { Routine } from '../types';
import { YouTubeThumb } from './YouTubeThumb';

export type TimerState = 'idle' | 'running' | 'paused' | 'finished';

type Props = {
  routine: Routine;
  completed: boolean;
  onToggleComplete: (id: string) => void;
  timerState: TimerState;
  timerRemainingMs: number;
  onStartTimer: (id: string, seconds: number) => void;
  onStopTimer: () => void;
  // Sortable wiring (provided by SortableRoutineCard)
  setNodeRef?: Ref<HTMLElement>;
  style?: CSSProperties;
  attributes?: HTMLAttributes<HTMLElement>;
  listeners?: HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
};

export function RoutineCard({
  routine,
  completed,
  onToggleComplete,
  timerState,
  timerRemainingMs,
  onStartTimer,
  onStopTimer,
  setNodeRef,
  style,
  attributes,
  listeners,
  isDragging,
}: Props) {
  const navigate = useNavigate();
  const safeUrl = isSafeHttpUrl(routine.url) ? routine.url : null;
  const timerSeconds = routine.timerSeconds ?? 0;
  const hasTimer = timerSeconds > 0;
  const isActive = timerState === 'running' || timerState === 'paused';
  const isInert = timerState === 'idle' && !hasTimer && !safeUrl;

  const openVideo = () => {
    if (safeUrl) window.open(safeUrl, '_blank', 'noopener,noreferrer');
  };

  const handleThumbClick = () => {
    if (timerState === 'idle') {
      openVideo();
      if (hasTimer) {
        onStartTimer(routine.id, timerSeconds);
        navigate('/timer');
      }
      return;
    }
    // Active states (running / paused / finished): jump to dedicated screen.
    navigate('/timer');
  };

  // Icon + time label vary by state
  let stateIcon: ReactNode = null;
  let timeLabel: string | null = null;
  let ariaLabel = '';
  const initialLabel = formatRemaining(timerSeconds * 1000);
  const remainingLabel = formatRemaining(timerRemainingMs);

  if (timerState === 'running') {
    stateIcon = <Pause size={28} fill="currentColor" />;
    timeLabel = remainingLabel;
    ariaLabel = `タイマー残り${remainingLabel}。タップでタイマー画面を開く`;
  } else if (timerState === 'paused') {
    stateIcon = <Play size={28} fill="currentColor" />;
    timeLabel = remainingLabel;
    ariaLabel = `一時停止中（残り${remainingLabel}）。タップでタイマー画面を開く`;
  } else if (timerState === 'finished') {
    stateIcon = <Check size={28} strokeWidth={3} />;
    timeLabel = '完了!';
    ariaLabel = 'タイマー完了。タップで確認画面を開く';
  } else if (isInert) {
    stateIcon = null;
    ariaLabel = '動画もタイマーも未設定';
  } else {
    stateIcon = <Play size={28} fill="currentColor" />;
    timeLabel = hasTimer ? initialLabel : null;
    ariaLabel = hasTimer && safeUrl
      ? `動画を開いてタイマー${initialLabel}を開始`
      : hasTimer
        ? `タイマー${initialLabel}を開始`
        : '動画を開く';
  }

  // Progress: ratio of elapsed time to total
  const progressPercent =
    hasTimer && (timerState === 'running' || timerState === 'paused')
      ? Math.max(0, Math.min(100, ((timerSeconds * 1000 - timerRemainingMs) / (timerSeconds * 1000)) * 100))
      : 0;

  const cardClassName = [
    'card',
    timerState === 'running' && 'card--running',
    timerState === 'paused' && 'card--paused',
    timerState === 'finished' && 'card--finished',
    isDragging && 'card--dragging',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article ref={setNodeRef} className={cardClassName} style={style} {...attributes}>
      <div className="card__thumb-area">
        <button
          type="button"
          className="card__thumb-btn"
          onClick={handleThumbClick}
          disabled={isInert}
          aria-label={ariaLabel}
        >
          <YouTubeThumb url={routine.url} />
          <span className="card__thumb-overlay" data-state={timerState} aria-hidden>
            {stateIcon && <span className="card__thumb-icon">{stateIcon}</span>}
            {timeLabel && <span className="card__thumb-time">{timeLabel}</span>}
          </span>
          {hasTimer && (timerState === 'running' || timerState === 'paused') && (
            <span
              className="card__thumb-progress"
              style={{ width: `${progressPercent}%` }}
              aria-hidden
            />
          )}
        </button>
        {isActive && (
          <button
            type="button"
            className="card__thumb-stop"
            onClick={onStopTimer}
            aria-label="タイマーを停止してリセット"
          >
            <X size={12} strokeWidth={3} />
          </button>
        )}
      </div>

      <div className="card__main">
        <header className="card__header">
          <h2 className="card__title">{routine.title || '(無題のルーティン)'}</h2>
          <div className="card__controls">
            <Link
              to={`/edit/${routine.id}`}
              className="card__edit"
              aria-label={`${routine.title}を編集`}
            >
              <Pencil size={18} />
            </Link>
            <button
              type="button"
              className="card__drag-handle"
              aria-label={`${routine.title}を並べ替え（ドラッグ）`}
              {...(listeners ?? {})}
            >
              <GripVertical size={18} />
            </button>
          </div>
        </header>

        <footer className="card__footer">
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
