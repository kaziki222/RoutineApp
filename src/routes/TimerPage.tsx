import { Check, ChevronLeft, Pause, Play } from 'lucide-react';
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useRoutines } from '../hooks/useRoutines';
import { formatRemaining, useTimer } from '../hooks/useTimer';

type State = 'running' | 'paused' | 'finished';

export function TimerPage() {
  const navigate = useNavigate();
  const { getRoutine } = useRoutines();
  const { activeTimer, remainingMs, pauseTimer, resumeTimer, stopTimer } = useTimer();

  // Bounce to home if no active timer (e.g., direct URL access or after stop).
  useEffect(() => {
    if (!activeTimer) navigate('/', { replace: true });
  }, [activeTimer, navigate]);

  if (!activeTimer) return null;

  const routine = getRoutine(activeTimer.routineId);
  if (!routine) {
    // Routine got deleted while timer was running — clean up and exit.
    stopTimer();
    return <Navigate to="/" replace />;
  }

  const isPaused = typeof activeTimer.pausedRemainingMs === 'number';
  const state: State = activeTimer.finished ? 'finished' : isPaused ? 'paused' : 'running';

  const handleMainAction = () => {
    if (state === 'running') pauseTimer();
    else if (state === 'paused') resumeTimer();
    else {
      stopTimer();
      navigate('/', { replace: true });
    }
  };

  const handleStopAndExit = () => {
    stopTimer();
    navigate('/', { replace: true });
  };

  const mainIcon =
    state === 'running' ? (
      <Pause size={48} fill="currentColor" />
    ) : state === 'paused' ? (
      <Play size={48} fill="currentColor" />
    ) : (
      <Check size={48} strokeWidth={3} />
    );

  const mainAriaLabel =
    state === 'running'
      ? 'タイマーを一時停止'
      : state === 'paused'
        ? 'タイマーを再開'
        : 'タイマー完了を確認して閉じる';

  const countdownLabel = state === 'finished' ? '完了!' : formatRemaining(remainingMs);

  return (
    <div className={`page page--timer page--timer-${state}`}>
      <button
        type="button"
        className="page__back timer-screen__back"
        onClick={() => navigate('/')}
        aria-label="ホームに戻る"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="timer-screen">
        <h1 className="timer-screen__title">{routine.title}</h1>
        <div className="timer-screen__countdown" aria-live="polite">
          {countdownLabel}
        </div>
        <button
          type="button"
          className={`timer-screen__main timer-screen__main--${state}`}
          onClick={handleMainAction}
          aria-label={mainAriaLabel}
        >
          {mainIcon}
        </button>
        {state !== 'finished' && (
          <button
            type="button"
            className="timer-screen__stop"
            onClick={handleStopAndExit}
          >
            タイマーを停止
          </button>
        )}
      </div>
    </div>
  );
}
