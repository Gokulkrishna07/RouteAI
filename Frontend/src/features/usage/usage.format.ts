import type {
  DailyUsage,
  MetricKey,
  ModelUsage,
  UsageDelta,
  UsageTotals,
} from '../../lib/usage'

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

const THOUSAND = 1_000
const MILLION = 1_000_000

export function formatCompact(value: number): string {
  if (value < THOUSAND) return String(value)
  if (value < MILLION) return `${trimZero(value / THOUSAND)}k`
  return `${trimZero(value / MILLION)}M`
}

function trimZero(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '')
}

export function formatNumber(value: number): string {
  return value.toLocaleString()
}

export function formatPercent(percent: number | null): string | null {
  if (percent === null) return null
  return `${percent > 0 ? '+' : ''}${percent}%`
}

/**
 * Dates arrive as `YYYY-MM-DD` calendar labels, already resolved to the user's
 * timezone by the API. Splitting the string rather than parsing it through
 * `Date` keeps a browser west of UTC from shifting every label back a day.
 */
function parts(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number)
  return { year, month, day }
}

export function formatShortDate(date: string): string {
  const { month, day } = parts(date)
  return `${month}/${day}`
}

export function formatLongDate(date: string): string {
  const { year, month, day } = parts(date)
  return `${MONTHS[month - 1]} ${day}, ${year}`
}

export function monthLabel(date: string): string {
  return MONTHS[parts(date).month - 1]
}

export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay()
}

export function metricValue(
  source: Pick<DailyUsage, 'requests' | 'totalTokens'>,
  metric: MetricKey,
): number {
  return metric === 'tokens' ? source.totalTokens : source.requests
}

export function modelMetricValue(model: ModelUsage, metric: MetricKey): number {
  return metric === 'tokens' ? model.totalTokens : model.requests
}

export function totalsMetricValue(totals: UsageTotals, metric: MetricKey): number {
  return metric === 'tokens' ? totals.totalTokens : totals.requests
}

/**
 * Mirrors the backend's delta rule so the headline arrow can follow the metric
 * toggle. The API only ships a token delta; recomputing both here keeps the two
 * metrics from taking different code paths.
 */
export function computeDelta(current: number, previous: number): UsageDelta {
  if (current === previous) {
    return { direction: 'flat', percent: 0, previousTokens: previous }
  }
  if (previous === 0) {
    return { direction: 'up', percent: null, previousTokens: previous }
  }
  return {
    direction: current > previous ? 'up' : 'down',
    percent: Number((((current - previous) / previous) * 100).toFixed(1)),
    previousTokens: previous,
  }
}

export function metricNoun(metric: MetricKey, value: number): string {
  if (metric === 'tokens') return 'tokens'
  return value === 1 ? 'request' : 'requests'
}
