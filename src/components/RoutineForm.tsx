import { useState, type FormEvent } from 'react';
import { isSafeHttpUrl } from '../lib/youtube';
import type { RoutineInput } from '../types';

type Props = {
  defaultValues?: Partial<RoutineInput>;
  submitLabel: string;
  onSubmit: (input: RoutineInput) => void;
  onCancel?: () => void;
  onDelete?: () => void;
};

export function RoutineForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
  onDelete,
}: Props) {
  const [title, setTitle] = useState(defaultValues?.title ?? '');
  const [description, setDescription] = useState(defaultValues?.description ?? '');
  const [url, setUrl] = useState(defaultValues?.url ?? '');
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
    setError(null);
    onSubmit({ title: trimmedTitle, description: description.trim(), url: trimmedUrl });
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
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
