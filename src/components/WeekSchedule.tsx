const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function WeekSchedule() {
  const now = new Date();
  const dow = now.getDay();
  const offsetToMon = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(now);
  monday.setDate(now.getDate() + offsetToMon);

  const days: Date[] = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }

  const todayK = dateKey(now);
  const monthLabel = `${now.getFullYear()} . ${now.getMonth() + 1}`;

  return (
    <section className="week" aria-label="今週のスケジュール">
      <p className="week__month">{monthLabel}</p>
      <div className="week__days">
        {days.map((d, i) => {
          const isToday = dateKey(d) === todayK;
          return (
            <div className="week__day" key={dateKey(d)}>
              <span className={`week__weekday${isToday ? ' week__weekday--today' : ''}`}>
                {WEEKDAYS[i]}
              </span>
              <div className={`week__circle${isToday ? ' week__circle--today' : ''}`}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
