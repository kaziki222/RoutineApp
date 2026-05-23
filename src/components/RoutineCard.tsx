import {
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Pause,
  Pencil,
  Play,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRemaining } from '../hooks/useTimer';
import { isSafeHttpUrl } from '../lib/youtube';
import type { Routine } from '../types';
import { YouTubeThumb } from './YouTubeThumb';

export type TimerState = 'idle' | 'running' | 'paused' | 'finished';

type Props = {
  routine: Routine;
  completed: boolean;
  onToggleComplete: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  timerState: TimerState;
  timerRemainingMs: number;
  onStartTimer: (id: string, seconds: number) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onStopTimer: () => void;
};

export function RoutineCard({
  routine,
  completed,
  onToggleComplete,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  timerState,
  timerRemainingMs,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopTimer,
}: Props) {
  const safeUrl = isSafeHttpUrl(routine.url) ? routine.url : null;
  const timerSeconds = routine.timerSeconds ?? 0;
  const hasTimer = timerSeconds > 0;

  const openVideo = () => {
    if (safeUrl) window.open(safeUrl, '_blank', 'noopener,noreferrer');
  };

  const handleStart = () => {
    openVideo();
    if (hasTimer) onStartTimer(routine.id, timerSeconds);
  };

  const initialLabel = formatRemaining(timerSeconds * 1000);
  const isActive = timerState === 'running' || timerState === 'paused';

  const cardClassName = [
    'card',
    timerState === 'running' && 'card--running',
    timerState === 'paused' && 'card--paused',
    timerState === 'finished' && 'card--finished',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={cardClassName}>
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
          {hasTimer ? (
            <>
              {timerState === 'running' && (
                <button
                  type="button"
                  className="btn-timer btn-timer--running"
                  onClick={onPauseTimer}
                  aria-label="タイマーを一時停止"
                >
                  <Pause size={12} fill="currentColor" />
                  <span className="btn-timer__time">{formatRemaining(timerRemainingMs)}</span>
                </button>
              )}
              {timerState === 'paused' && (
                <button
                  type="button"
                  className="btn-timer btn-timer--paused"
                  onClick={onResumeTimer}
                  aria-label="タイマーを再開"
                >
                  <Play size={12} fill="currentColor" />
                  <span className="btn-timer__time">{formatRemaining(timerRemainingMs)}</span>
                </button>
              )}
              {timerState === 'finished' && (
                <button
                  type="button"
                  className="btn-timer btn-timer--finished"
                  onClick={onStopTimer}
                  aria-label="タイマー完了。閉じる"
                >
                  <Check size={12} strokeWidth={3} />
                  <span className="btn-timer__time">完了!</span>
                </button>
              )}
              {timerState === 'idle' && (
                <button
                  type="button"
                  className="btn-timer btn-timer--idle"
                  onClick={handleStart}
                  aria-label={`タイマー${initialLabel}で開始`}
                >
                  <Play size={12} fill="currentColor" />
                  <span className="btn-timer__time">{initialLabel}</span>
                </button>
              )}
              {isActive && (
                <button
                  type="button"
                  className="btn-timer-stop"
                  onClick={onStopTimer}
                  aria-label="タイマーを停止してリセット"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              )}
            </>
          ) : (
            safeUrl && (
              <button
                type="button"
                className="btn-link"
                onClick={openVideo}
                aria-label="動画URLを開く"
              >
                URLへ <ExternalLink size={12} strokeWidth={2.5} />
              </button>
            )
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
