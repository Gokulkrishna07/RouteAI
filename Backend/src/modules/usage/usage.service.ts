import {
  getDailyActivity,
  getDailyModelUsage,
  getModelTotals,
  getUsageTotals,
} from "./usage.repository";
import {
  ACTIVITY_DAYS,
  PERIOD_DAYS,
  type ActivityDay,
  type ActivityStats,
  type DailyModelUsage,
  type DailyUsage,
  type ModelUsage,
  type UsageDashboard,
  type UsageDelta,
  type UsagePeriod,
} from "./usage.types";

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE;
const DAYS_PER_WEEK = 7;

interface UsageRange {
  from: Date;
  to: Date;
  previousFrom: Date;
  days: number;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

function toLocalDayLabel(date: Date, tzOffset: number): string {
  return new Date(date.getTime() - tzOffset * MS_PER_MINUTE)
    .toISOString()
    .slice(0, 10);
}

function startOfLocalDay(date: Date, tzOffset: number): Date {
  const local = new Date(date.getTime() - tzOffset * MS_PER_MINUTE);
  const midnight = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate(),
  );

  return new Date(midnight + tzOffset * MS_PER_MINUTE);
}

function dayLabels(from: Date, count: number, tzOffset: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    toLocalDayLabel(addDays(from, index), tzOffset),
  );
}

function round(value: number): number {
  return Number(value.toFixed(1));
}

export function resolveRange(
  period: UsagePeriod,
  tzOffset: number,
  now: Date,
): UsageRange {
  const days = PERIOD_DAYS[period];
  const to = addDays(startOfLocalDay(now, tzOffset), 1);
  const from = addDays(to, -days);

  return { from, to, previousFrom: addDays(from, -days), days };
}

export function computeDelta(current: number, previous: number): UsageDelta {
  if (current === previous) {
    return { direction: "flat", percent: 0, previousTokens: previous };
  }

  if (previous === 0) {
    return { direction: "up", percent: null, previousTokens: previous };
  }

  return {
    direction: current > previous ? "up" : "down",
    percent: round(((current - previous) / previous) * 100),
    previousTokens: previous,
  };
}

function toModelUsage({
  provider,
  model,
  requests,
  totalTokens,
}: DailyModelUsage): ModelUsage {
  return { provider, model, requests, totalTokens };
}

export function buildDaily(
  rows: DailyModelUsage[],
  labels: string[],
): DailyUsage[] {
  const byDay = new Map<string, DailyModelUsage[]>();

  for (const row of rows) {
    const existing = byDay.get(row.day);
    if (existing) {
      existing.push(row);
    } else {
      byDay.set(row.day, [row]);
    }
  }

  const days = labels.map((date) => {
    const dayRows = byDay.get(date) ?? [];

    return {
      date,
      requests: dayRows.reduce((sum, row) => sum + row.requests, 0),
      promptTokens: dayRows.reduce((sum, row) => sum + row.promptTokens, 0),
      outputTokens: dayRows.reduce((sum, row) => sum + row.outputTokens, 0),
      totalTokens: dayRows.reduce((sum, row) => sum + row.totalTokens, 0),
      models: dayRows
        .map(toModelUsage)
        .sort((a, b) => b.totalTokens - a.totalTokens),
    };
  });

  return days.map((day, index) => ({
    ...day,
    delta: computeDelta(
      day.totalTokens,
      index === 0 ? 0 : days[index - 1].totalTokens,
    ),
  }));
}

export function buildActivity(
  rows: ActivityDay[],
  labels: string[],
): ActivityDay[] {
  const byDay = new Map(rows.map((row) => [row.date, row]));

  return labels.map(
    (date) => byDay.get(date) ?? { date, requests: 0, totalTokens: 0 },
  );
}

export function buildActivityStats(activity: ActivityDay[]): ActivityStats {
  let longestStreak = 0;
  let running = 0;

  for (const day of activity) {
    running = day.requests > 0 ? running + 1 : 0;
    if (running > longestStreak) {
      longestStreak = running;
    }
  }

  let currentStreak = 0;

  for (let index = activity.length - 1; index >= 0; index -= 1) {
    if (activity[index].requests === 0) {
      break;
    }
    currentStreak += 1;
  }

  const total = activity.reduce((sum, day) => sum + day.totalTokens, 0);
  const avgPerDay = activity.length > 0 ? total / activity.length : 0;

  return {
    longestStreak,
    currentStreak,
    avgPerDay: round(avgPerDay),
    avgPerWeek: round(avgPerDay * DAYS_PER_WEEK),
    total,
  };
}

export async function getUsageDashboard(
  userId: string,
  period: UsagePeriod,
  tzOffset: number,
  now: Date = new Date(),
): Promise<UsageDashboard> {
  const range = resolveRange(period, tzOffset, now);
  const dailyFrom = addDays(range.from, -1);
  const activityFrom = addDays(range.to, -ACTIVITY_DAYS);

  const [totals, previousTotals, dailyRows, models, activityRows] =
    await Promise.all([
      getUsageTotals(userId, range.from, range.to),
      getUsageTotals(userId, range.previousFrom, range.from),
      getDailyModelUsage(userId, dailyFrom, range.to, tzOffset),
      getModelTotals(userId, range.from, range.to),
      getDailyActivity(userId, activityFrom, range.to, tzOffset),
    ]);

  const daily = buildDaily(
    dailyRows,
    dayLabels(dailyFrom, range.days + 1, tzOffset),
  ).slice(1);

  const activity = buildActivity(
    activityRows,
    dayLabels(activityFrom, ACTIVITY_DAYS, tzOffset),
  );

  return {
    period,
    from: toLocalDayLabel(range.from, tzOffset),
    to: toLocalDayLabel(addDays(range.to, -1), tzOffset),
    totals,
    previousTotals,
    delta: computeDelta(totals.totalTokens, previousTotals.totalTokens),
    daily,
    models,
    activity,
    activityStats: buildActivityStats(activity),
  };
}
