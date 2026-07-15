const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "2022-01" -> "Jan 2022". Returns the raw string unchanged if it doesn't parse — never guesses a date. */
export function formatMonthYear(date: string): string {
  const match = /^(\d{4})-(\d{2})/.exec(date);
  if (!match) return date;

  const monthIndex = Number(match[2]) - 1;
  const monthName = MONTH_NAMES[monthIndex];
  if (!monthName) return date;

  return `${monthName} ${match[1]}`;
}

/** endDate: null means "current" (see docs/DATA_MODEL.md) -> "Present". */
export function formatDateRange(startDate: string, endDate: string | null): string {
  const start = startDate ? formatMonthYear(startDate) : "";
  const end = endDate ? formatMonthYear(endDate) : "Present";

  if (!start) return endDate ? end : "";

  return `${start} – ${end}`;
}
