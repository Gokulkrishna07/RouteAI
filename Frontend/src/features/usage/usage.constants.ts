import type { MetricKey, UsagePeriod } from '../../lib/usage'

export const PERIOD_OPTIONS: { value: UsagePeriod; label: string }[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
]

export const METRIC_OPTIONS: { value: MetricKey; label: string }[] = [
  { value: 'tokens', label: 'Tokens' },
  { value: 'requests', label: 'Requests' },
]

export const MODEL_COLORS = [
  '#818CF8',
  '#34D399',
  '#F59E0B',
  '#F472B6',
  '#22D3EE',
  '#A78BFA',
  '#FB7185',
  '#4ADE80',
] as const

export const FALLBACK_MODEL_COLOR = '#94A3B8'

export const HEATMAP_LEVELS = 4

export const TOP_MODELS_LIMIT = 6

export const CHART_HEIGHT = 220

export const REQUEST_ERRORS = {
  load: 'Could not load your usage. Please try again.',
} as const
