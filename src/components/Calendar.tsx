import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { dateKey, daysInMonth, firstWeekday, todayKey } from '../lib/date';

type Props = {
  stamps: string[];
  year: number;
  monthIndex: number;
  selectedDate: string;
  monthRatePercent: number;
  monthStampCount: number;
  onSelectDate: (date: string) => void;
  onPrev: () => void;
  onNext: () => void;
};

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export function Calendar({
  stamps,
  year,
  monthIndex,
  selectedDate,
  monthRatePercent,
  monthStampCount,
  onSelectDate,
  onPrev,
  onNext,
}: Props) {
  const today = todayKey();
  const stampSet = new Set(stamps);
  const total = daysInMonth(year, monthIndex);
  const offset = firstWeekday(year, monthIndex);

  type Cell = { key: string; day: number | null; dateK: string | null };
  const cells: Cell[] = [];
  for (let i = 0; i < offset; i += 1) {
    cells.push({ key: `pad-${i}`, day: null, dateK: null });
  }
  for (let day = 1; day <= total; day += 1) {
    const k = dateKey(year, monthIndex, day);
    cells.push({ key: k, day, dateK: k });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ key: `pad-end-${cells.length}`, day: null, dateK: null });
  }

  return (
    <section className="cal">
      <header className="cal__header">
        <button type="button" className="cal__nav" onClick={onPrev} aria-label="前の月">
          <ChevronLeft size={22} />
        </button>
        <h2 className="cal__title">
          {year} . {monthIndex + 1}
        </h2>
        <button type="button" className="cal__nav" onClick={onNext} aria-label="次の月">
          <ChevronRight size={22} />
        </button>
      </header>
      <p className="cal__rate">月間達成率 {monthRatePercent}%</p>
      <p className="cal__summary">今月 {monthStampCount} 日達成</p>
      <div className="cal__weekdays" aria-hidden>
        {WEEKDAYS.map((w) => (
          <span key={w} className="cal__weekday">
            {w}
          </span>
        ))}
      </div>
      <div className="cal__grid" role="grid">
        {cells.map((cell) => {
          if (cell.day === null || cell.dateK === null) {
            return <div key={cell.key} className="cal__cell cal__cell--empty" role="gridcell" />;
          }
          const isToday = cell.dateK === today;
          const isSelected = cell.dateK === selectedDate;
          const isStamped = stampSet.has(cell.dateK);
          const cls = [
            'cal__cell',
            isToday && 'cal__cell--today',
            isSelected && 'cal__cell--selected',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={cell.key}
              type="button"
              className={cls}
              onClick={() => onSelectDate(cell.dateK as string)}
              aria-pressed={isSelected}
              aria-label={`${monthIndex + 1}月${cell.day}日`}
            >
              <span className="cal__day">{cell.day}</span>
              {isStamped && (
                <span className="cal__stamp" aria-hidden>
                  <Check size={20} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
