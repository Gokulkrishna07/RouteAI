import { Box, MenuItem, Select, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { fonts, fontSizes } from '../../../constants'
import { useDocsTheme } from '../../../docs/DocsLayout'
import type { MetricKey, UsageDashboard, UsagePeriod } from '../../../lib/usage'
import { METRIC_OPTIONS, PERIOD_OPTIONS } from '../usage.constants'
import { computeDelta, formatNumber, metricNoun, totalsMetricValue } from '../usage.format'
import { DailyUsageChart } from './DailyUsageChart'
import { TopModelsList } from './TopModelsList'
import { TrendArrow } from './TrendArrow'

export function UsageSummaryCard({
  dashboard,
  period,
  onPeriodChange,
  metric,
  onMetricChange,
  colors,
}: {
  dashboard: UsageDashboard
  period: UsagePeriod
  onPeriodChange: (period: UsagePeriod) => void
  metric: MetricKey
  onMetricChange: (metric: MetricKey) => void
  colors: Map<string, string>
}) {
  const { c } = useDocsTheme()
  const total = totalsMetricValue(dashboard.totals, metric)
  const delta = computeDelta(total, totalsMetricValue(dashboard.previousTotals, metric))

  return (
    <Box sx={{ border: `1px solid ${c.border}`, borderRadius: 2, p: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1.5,
          mb: 3,
        }}
      >
        <Typography
          sx={{
            fontFamily: fonts.heading,
            fontSize: fontSizes.h3,
            fontWeight: 700,
            color: c.textPrimary,
            mr: 0.5,
          }}
        >
          Usage summary
        </Typography>

        <Select
          size="small"
          value={period}
          onChange={(event) => onPeriodChange(event.target.value as UsagePeriod)}
          sx={{
            fontSize: fontSizes.small,
            color: c.textPrimary,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: c.border },
            '& .MuiSvgIcon-root': { color: c.textSecondary },
          }}
        >
          {PERIOD_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value} sx={{ fontSize: fontSizes.small }}>
              {option.label}
            </MenuItem>
          ))}
        </Select>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={metric}
          onChange={(_event, next: MetricKey | null) => next && onMetricChange(next)}
        >
          {METRIC_OPTIONS.map((option) => (
            <ToggleButton
              key={option.value}
              value={option.value}
              sx={{
                px: 1.5,
                textTransform: 'none',
                fontSize: fontSizes.small,
                color: c.textSecondary,
                borderColor: c.border,
                '&.Mui-selected': { color: c.accent, bgcolor: c.accentBg },
              }}
            >
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: { xs: 4, md: 5 },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: fonts.heading,
              fontSize: '2.5rem',
              fontWeight: 700,
              color: c.textPrimary,
              lineHeight: 1.1,
            }}
          >
            {formatNumber(total)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 3 }}>
            <TrendArrow delta={delta} suffix="vs prev period" />
          </Box>

          <Typography sx={{ fontSize: fontSizes.tiny, color: c.textMuted, mb: 1.5 }}>
            Daily · by model
          </Typography>

          <DailyUsageChart daily={dashboard.daily} metric={metric} colors={colors} />
        </Box>

        <Box sx={{ borderLeft: { md: `1px solid ${c.border}` }, pl: { md: 4 } }}>
          <Typography sx={{ fontSize: fontSizes.small, fontWeight: 600, color: c.textPrimary, mb: 0.25 }}>
            Top models
          </Typography>
          <Typography sx={{ fontSize: fontSizes.tiny, color: c.textMuted, mb: 2.5 }}>
            by {metricNoun(metric, 2)}
          </Typography>
          <TopModelsList models={dashboard.models} metric={metric} colors={colors} />
        </Box>
      </Box>
    </Box>
  )
}
