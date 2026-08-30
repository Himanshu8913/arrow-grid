/**
 * Formats remaining time until a seasonal event ends.
 */
export function getSeasonalEventTimeRemaining(
  event: { dateRange: { endMonth: number; endDay: number } },
  date = new Date(),
): string {
  const year = date.getUTCFullYear();
  const end = new Date(
    Date.UTC(year, event.dateRange.endMonth - 1, event.dateRange.endDay, 23, 59, 59),
  );
  let remainingMs = end.getTime() - date.getTime();

  if (remainingMs < 0) {
    const nextEnd = new Date(
      Date.UTC(year + 1, event.dateRange.endMonth - 1, event.dateRange.endDay, 23, 59, 59),
    );
    remainingMs = nextEnd.getTime() - date.getTime();
  }

  const totalHours = Math.max(0, Math.floor(remainingMs / 3_600_000));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  return `${days}d ${hours}h left`;
}
