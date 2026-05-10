export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dateKey(y: number, monthIndex: number, day: number): string {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatYearMonth(y: number, monthIndex: number): string {
  return `${y}年${monthIndex + 1}月`;
}

export function daysInMonth(y: number, monthIndex: number): number {
  return new Date(y, monthIndex + 1, 0).getDate();
}

export function firstWeekday(y: number, monthIndex: number): number {
  return new Date(y, monthIndex, 1).getDay();
}
