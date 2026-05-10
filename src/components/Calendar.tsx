import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
  dateKey,
  daysInMonth,
  firstWeekday,
  formatYearMonth,
  todayKey,
} from '../lib/date';

type Props = {
  stamps: string[];
};

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export function Calendar({ stamps }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());

  const today = todayKey();
  const stampSet = new Set(stamps);

  const total = daysInMonth(year, monthIndex);
  const offset = firstWeekday(year, monthIndex);
  const cells: Array<{ key: string; day: number | null; isStamped: boolean; isToday: boolean }> = [];

  for (let i = 0; i < offset; i += 1) {
    cells.push({ key: `pad-${i}`, day: null, isStamped: false, isToday: false });
  }
  for (let day = 1; day <= total; day += 1) {
    const key = dateKey(year, monthIndex, day);
    cells.push({
      key,
      day,
      isStamped: stampSet.has(key),
      isToday: key === today,
    });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ key: `pad-end-${cells.length}`, day: null, isStamped: false, isToday: false });
  }

  const monthCount = cells.filter((c) => c.isStamped).length;

  const goPrev = () => {
    if (monthIndex === 0) {
      setMonthIndex(11);
      setYear(year - 1);
    } else {
      setMonthIndex(monthIndex - 1);
    }
  };
  const goNext = () => {
    if (monthIndex === 11) {
      setMonthIndex(0);
      setYear(year + 1);
    } else {
      setMonthIndex(monthIndex + 1);
    }
  };

  return (
    <section className="cal">
      <header className="cal__header">
        <button type="button" className="cal__nav" onClick={goPrev} aria-label="前の月">
          <ChevronLeft size={22} />
        </button>
        <h2 className="cal__title">{formatYearMonth(year, monthIndex)}</h2>
        <button type="button" className="cal__nav" onClick={goNext} aria-label="次の月">
          <ChevronRight size={22} />
        </button>
      </header>
      <p className="cal__summary">今月 {monthCount} 日達成</p>
      <div className="cal__weekdays" aria-hidden>
        {WEEKDAYS.map((w) => (
          <span key={w} className="cal__weekday">
            {w}
          </span>
        ))}
      </div>
      <div className="cal__grid" role="grid">
        {cells.map((cell) => (
          <div
            key={cell.key}
            className={`cal__cell${cell.day === null ? ' cal__cell--empty' : ''}${
              cell.isToday ? ' cal__cell--today' : ''
            }`}
            role="gridcell"
          >
            {cell.day !== null && (
              <>
                <span className="cal__day">{cell.day}</span>
                {cell.isStamped && (
                  <span className="cal__stamp" aria-label="達成">
                    <Check size={20} strokeWidth={3} />
                  </span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
