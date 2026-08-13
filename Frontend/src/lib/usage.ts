import { apiClient } from './apiClient'

export type UsagePeriod = '7d' | '30d' | '90d'

export type MetricKey = 'tokens' | 'requests'

export type DeltaDirection = 'up' | 'down' | 'flat'

export type UsageDelta = {
  direction: DeltaDirection
  percent: number | null
  previousTokens: number
}

export type UsageTotals = {
  requests: number
  promptTokens: number
  outputTokens: number
  totalTokens: number
}

export type ModelUsage = {
  provider: string
  model: string
  requests: number
  totalTokens: number
}

export type DailyUsage = {
  date: string
  requests: number
  promptTokens: number
  outputTokens: number
  totalTokens: number
  models: ModelUsage[]
  delta: UsageDelta
}

export type ActivityDay = {
  date: string
  requests: number
  totalTokens: number
}

export type ActivityStats = {
  longestStreak: number
  currentStreak: number
  avgPerDay: number
  avgPerWeek: number
  total: number
}

export type UsageDashboard = {
  period: UsagePeriod
  from: string
  to: string
  totals: UsageTotals
  previousTotals: UsageTotals
  delta: UsageDelta
  daily: DailyUsage[]
  models: ModelUsage[]
  activity: ActivityDay[]
  activityStats: ActivityStats
}

const ENDPOINT = '/usage/me/dashboard'

/**
 * The single place `getTimezoneOffset()` is read. The backend buckets rows into
 * local calendar days from this value, so a caller that forgets it silently
 * gets UTC buckets and days that are off by one.
 */
export async function fetchUsageDashboard(period: UsagePeriod): Promise<UsageDashboard> {
  const response = await apiClient.get<{ data: UsageDashboard }>(ENDPOINT, {
    params: { period, tzOffset: new Date().getTimezoneOffset() },
  })
  return response.data.data
}

export function modelKey(model: Pick<ModelUsage, 'provider' | 'model'>): string {
  return `${model.provider}/${model.model}`
}
