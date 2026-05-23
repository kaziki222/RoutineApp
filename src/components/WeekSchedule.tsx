import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMondayOf(d: Date): Date {
  const dow = d.getDay();
  const offsetToMon = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(d.getDate() + offsetToMon);
  return monday;
}

type Props = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

export function WeekSchedule({ selectedDate, onSelectDate }: Props) {
  const today = new Date();
  const todayK = dateKey(today);
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOf(today));

  const days: Date[] = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push(d);
  }

  const goPrev = () => {
    const next = new Date(weekStart);
    next.setDate(weekStart.getDate() - 7);
    setWeekStart(next);
  };
  const goNext = () => {
    const next = new Date(weekStart);
    next.setDate(weekStart.getDate() + 7);
    setWeekStart(next);
  };

  // Month label tracks the middle of the displayed week to avoid mid-week month edges.
  const mid = new Date(weekStart);
  mid.setDate(weekStart.getDate() + 3);
  const monthLabel = `${mid.getFullYear()} . ${mid.getMonth() + 1}`;

  return (
    <section className="week" aria-label="週間スケジュール">
      <div className="week__header">
        <button
          type="button"
          className="week__nav-btn"
          onClick={goPrev}
          aria-label="前の週"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="week__month">{monthLabel}</p>
        <button
          type="button"
          className="week__nav-btn"
          onClick={goNext}
          aria-label="次の週"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="week__days">
        {days.map((d, i) => {
          const k = dateKey(d);
          const isToday = k === todayK;
          const isSelected = k === selectedDate;
          const circleClass = [
            'week__circle',
            isToday && 'week__circle--today',
            isSelected && 'week__circle--selected',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              type="button"
              className="week__day"
              key={k}
              onClick={() => onSelectDate(k)}
              aria-pressed={isSelected}
              aria-label={`${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[i]}`}
            >
              <span className={`week__weekday${isToday ? ' week__weekday--today' : ''}`}>
                {WEEKDAYS[i]}
              </span>
              <span className={circleClass}>{d.getDate()}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
