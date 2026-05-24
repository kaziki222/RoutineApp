import { useDroppable } from '@dnd-kit/core';
import { Check, Pencil, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { Section } from '../types';

type Props = {
  section: Section;
  count: number;
  onRename: (id: string, title: string) => void;
  children: ReactNode;
};

export function SectionBlock({ section, count, onRename, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `section:${section.id}` });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(section.title);

  const commit = () => {
    onRename(section.id, draft);
    setEditing(false);
  };

  return (
    <section className="section-block">
      <header className="section-block__header">
        {editing ? (
          <div className="section-block__edit">
            <input
              className="section-block__input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') {
                  setDraft(section.title);
                  setEditing(false);
                }
              }}
              autoFocus
              maxLength={40}
            />
            <button type="button" className="section-block__icon" onClick={commit} aria-label="保存">
              <Check size={16} strokeWidth={3} />
            </button>
            <button
              type="button"
              className="section-block__icon"
              onClick={() => {
                setDraft(section.title);
                setEditing(false);
              }}
              aria-label="キャンセル"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <>
            <h2 className="section-block__title">
              {section.title}
              <span className="section-block__count">{count}</span>
            </h2>
            <button
              type="button"
              className="section-block__icon"
              onClick={() => {
                setDraft(section.title);
                setEditing(true);
              }}
              aria-label={`${section.title}を編集`}
            >
              <Pencil size={16} />
            </button>
          </>
        )}
      </header>
      <div
        ref={setNodeRef}
        className={`section-block__drop${isOver ? ' section-block__drop--over' : ''}`}
      >
        {count === 0 ? (
          <p className="section-block__empty">ここにドラッグ、または＋から追加</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
