import {
  SEASONAL_EVENT_PRIORITY,
  SEASONAL_EVENTS,
  type SeasonalDateRange,
  type SeasonalEventDefinition,
  type SeasonalEventId,
} from "@/data/seasonal-events";

function toMonthDayValue(month: number, day: number): number {
  return month * 100 + day;
}

function isDateInRange(
  month: number,
  day: number,
  range: SeasonalDateRange,
): boolean {
  const value = toMonthDayValue(month, day);
  const start = toMonthDayValue(range.startMonth, range.startDay);
  const end = toMonthDayValue(range.endMonth, range.endDay);

  if (start <= end) {
    return value >= start && value <= end;
  }

  return value >= start || value <= end;
}

export function isSeasonalEventActive(
  event: SeasonalEventDefinition,
  date = new Date(),
): boolean {
  return isDateInRange(
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    event.dateRange,
  );
}

/**
 * Returns the highest-priority seasonal event active on the given date.
 */
export function getActiveSeasonalEvent(
  date = new Date(),
): SeasonalEventDefinition | undefined {
  for (const eventId of SEASONAL_EVENT_PRIORITY) {
    const event = SEASONAL_EVENTS.find((entry) => entry.id === eventId);

    if (event && isSeasonalEventActive(event, date)) {
      return event;
    }
  }

  return undefined;
}

export function getUpcomingSeasonalEvents(
  date = new Date(),
): SeasonalEventDefinition[] {
  return SEASONAL_EVENTS.filter((event) => !isSeasonalEventActive(event, date));
}

/**
 * Simulated global community progress for display (local-only, no backend).
 */
export function getSimulatedCommunityProgress(
  eventId: SeasonalEventId,
  localWins: number,
): { current: number; target: number; percent: number } {
  const target = 5_000_000;
  const base = 4_200_000 + (eventId.length * 137_000);
  const current = Math.min(target, base + localWins * 12_500);

  return {
    current,
    target,
    percent: Math.round((current / target) * 100),
  };
}

export function formatSeasonalCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return String(value);
}
