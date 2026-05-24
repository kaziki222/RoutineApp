import { useState } from 'react';
import { Calendar } from '../components/Calendar';
import { computeDayRate, useHistory } from '../hooks/useHistory';
import { useRoutines } from '../hooks/useRoutines';
import { dateKey, daysInMonth, todayKey } from '../lib/date';

function formatJP(date: string): string {
  const [, m, d] = date.split('-');
  return `${Number(m)}月${Number(d)}日`;
}

export function StampCardPage() {
  const { routines } = useRoutines();
  const { history, stamps } = useHistory();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(todayKey());

  const today = todayKey();

  // Visible routine IDs that "existed" for a given date (current routines + that day's tasks).
  const visibleIdsForDate = (date: string): string[] =>
    routines
      .filter((r) => r.kind === 'routine' || (r.kind === 'task' && r.taskDate === date))
      .map((r) => r.id);

  const selectedRate = computeDayRate(history, selectedDate, visibleIdsForDate(selectedDate));

  // Month rate: aggregate completed / total across days the user actually
  // engaged with (days that earned a stamp). This avoids penalizing days
  // before the user started using a given routine.
  const totalDays = daysInMonth(year, monthIndex);
  let monthCompleted = 0;
  let monthTotal = 0;
  let monthStampCount = 0;
  const stampSet = new Set(stamps);
  for (let d = 1; d <= totalDays; d += 1) {
    const k = dateKey(year, monthIndex, d);
    if (!stampSet.has(k)) continue;
    monthStampCount += 1;
    const ids = visibleIdsForDate(k);
    if (ids.length === 0) continue;
    const r = computeDayRate(history, k, ids);
    monthCompleted += r.completed;
    monthTotal += r.total;
  }
  const monthRatePercent = monthTotal === 0 ? 0 : Math.round((monthCompleted / monthTotal) * 100);

  const goPrev = () => {
    if (monthIndex === 0) {
      setMonthIndex(11);
      setYear((y) => y - 1);
    } else {
      setMonthIndex((m) => m - 1);
    }
  };
  const goNext = () => {
    if (monthIndex === 11) {
      setMonthIndex(0);
      setYear((y) => y + 1);
    } else {
      setMonthIndex((m) => m + 1);
    }
  };

  return (
    <div className="page page--stamps">
      <h1 className="page__title">Stamp Card</h1>
      <Calendar
        stamps={stamps}
        year={year}
        monthIndex={monthIndex}
        selectedDate={selectedDate}
        monthRatePercent={monthRatePercent}
        monthStampCount={monthStampCount}
        onSelectDate={setSelectedDate}
        onPrev={goPrev}
        onNext={goNext}
      />
      <div className="day-rate day-rate--stamp">
        <span className="day-rate__label">
          {selectedDate === today ? '今日' : formatJP(selectedDate)}の達成率
        </span>
        <span className="day-rate__value">{selectedRate.percent}%</span>
        <span className="day-rate__count">
          {selectedRate.completed}/{selectedRate.total}
        </span>
      </div>
    </div>
  );
}
