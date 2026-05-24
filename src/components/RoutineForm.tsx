import { useState, type FormEvent } from 'react';
import { useSections } from '../hooks/useSections';
import { isSafeHttpUrl } from '../lib/youtube';
import type { RoutineInput, RoutineKind } from '../types';

type Props = {
  defaultValues?: Partial<RoutineInput>;
  submitLabel: string;
  onSubmit: (input: RoutineInput) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  lockKind?: boolean; // hide kind toggle (e.g. editing existing)
};

export function RoutineForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
  onDelete,
  lockKind,
}: Props) {
  const { sections } = useSections();
  const initialTimerSeconds = defaultValues?.timerSeconds ?? 0;
  const [title, setTitle] = useState(defaultValues?.title ?? '');
  const [description, setDescription] = useState(defaultValues?.description ?? '');
  const [url, setUrl] = useState(defaultValues?.url ?? '');
  const [kind, setKind] = useState<RoutineKind>(defaultValues?.kind ?? 'routine');
  const [sectionId, setSectionId] = useState<string>(
    defaultValues?.sectionId ?? sections[0]?.id ?? ''
  );
  const [timerMinutes, setTimerMinutes] = useState<string>(
    initialTimerSeconds > 0 ? String(Math.floor(initialTimerSeconds / 60)) : ''
  );
  const [timerExtraSeconds, setTimerExtraSeconds] = useState<string>(
    initialTimerSeconds > 0 && initialTimerSeconds % 60 !== 0
      ? String(initialTimerSeconds % 60)
      : ''
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();

    if (!trimmedTitle) {
      setError('タイトルを入力してください');
      return;
    }
    if (trimmedUrl && !isSafeHttpUrl(trimmedUrl)) {
      setError('URLは http:// または https:// で始まる必要があります');
      return;
    }

    const minutes = Math.max(0, Math.min(180, Number(timerMinutes) || 0));
    const seconds = Math.max(0, Math.min(59, Number(timerExtraSeconds) || 0));
    const totalSeconds = minutes * 60 + seconds;

    setError(null);
    onSubmit({
      title: trimmedTitle,
      description: description.trim(),
      url: trimmedUrl,
      timerSeconds: totalSeconds,
      kind,
      sectionId: sectionId || sections[0]?.id || '',
    });
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {!lockKind && (
        <fieldset className="form__field form__kind">
          <legend className="form__label">種類</legend>
          <div className="seg">
            <button
              type="button"
              className={`seg__btn${kind === 'routine' ? ' seg__btn--active' : ''}`}
              onClick={() => setKind('routine')}
            >
              ルーティン
            </button>
            <button
              type="button"
              className={`seg__btn${kind === 'task' ? ' seg__btn--active' : ''}`}
              onClick={() => setKind('task')}
            >
              タスク
            </button>
          </div>
          <p className="form__hint">
            {kind === 'routine' ? '毎日くり返し表示されます' : 'その日だけのタスクです'}
          </p>
        </fieldset>
      )}

      <label className="form__field">
        <span className="form__label">セクション</span>
        <select
          className="form__input"
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </label>

      <label className="form__field">
        <span className="form__label">タイトル</span>
        <input
          type="text"
          className="form__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：ラジオ体操"
          maxLength={80}
          autoFocus
          required
        />
      </label>

      <label className="form__field">
        <span className="form__label">説明</span>
        <textarea
          className="form__input form__textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="例：パーソナルジム並のメニュー"
          maxLength={500}
          rows={3}
        />
      </label>

      <label className="form__field">
        <span className="form__label">YouTube等のURL（任意）</span>
        <input
          type="url"
          className="form__input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
        />
      </label>

      <fieldset className="form__field form__timer">
        <legend className="form__label">タイマー（任意）</legend>
        <div className="form__timer-row">
          <label className="form__timer-input">
            <input
              type="number"
              className="form__input"
              value={timerMinutes}
              onChange={(e) => setTimerMinutes(e.target.value)}
              min={0}
              max={180}
              inputMode="numeric"
              placeholder="0"
            />
            <span className="form__timer-unit">分</span>
          </label>
          <label className="form__timer-input">
            <input
              type="number"
              className="form__input"
              value={timerExtraSeconds}
              onChange={(e) => setTimerExtraSeconds(e.target.value)}
              min={0}
              max={59}
              inputMode="numeric"
              placeholder="0"
            />
            <span className="form__timer-unit">秒</span>
          </label>
        </div>
        <p className="form__hint">設定するとサムネイルがタイマーになります</p>
      </fieldset>

      {error && <p className="form__error" role="alert">{error}</p>}

      <div className="form__actions">
        <button type="submit" className="btn btn--primary">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            キャンセル
          </button>
        )}
      </div>

      {onDelete && (
        <button
          type="button"
          className="btn btn--danger"
          onClick={() => {
            if (window.confirm('このルーティンを削除しますか？')) onDelete();
          }}
        >
          削除する
        </button>
      )}
    </form>
  );
}
