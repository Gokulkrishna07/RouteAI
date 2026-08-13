import { Box, Tooltip, Typography } from '@mui/material'
import { fontSizes } from '../../../constants'
import { useDocsTheme } from '../../../docs/DocsLayout'
import type { DailyUsage, MetricKey, ModelUsage } from '../../../lib/usage'
import { colorFor } from '../usage.colors'
import { CHART_HEIGHT } from '../usage.constants'
import {
  formatCompact,
  formatLongDate,
  formatShortDate,
  metricNoun,
  metricValue,
  modelMetricValue,
} from '../usage.format'

const MAX_TICK_LABELS = 8

function BarTooltip({ day, metric }: { day: DailyUsage; metric: MetricKey }) {
  const total = metricValue(day, metric)

  return (
    <Box sx={{ py: 0.5 }}>
      <Typography sx={{ fontSize: fontSizes.small, fontWeight: 600, mb: 0.5 }}>
        {formatLongDate(day.date)}
      </Typography>
      <Typography sx={{ fontSize: fontSizes.small, mb: day.models.length ? 0.75 : 0 }}>
        {total.toLocaleString()} {metricNoun(metric, total)}
      </Typography>
      {day.models.map((model) => (
        <Typography key={`${model.provider}/${model.model}`} sx={{ fontSize: fontSizes.tiny }}>
          {model.model} · {modelMetricValue(model, metric).toLocaleString()}
        </Typography>
      ))}
    </Box>
  )
}

function Segment({
  model,
  share,
  colors,
}: {
  model: ModelUsage
  share: number
  colors: Map<string, string>
}) {
  return (
    <Box
      sx={{
        height: `${share * 100}%`,
        bgcolor: colorFor(colors, model),
        '&:first-of-type': { borderRadius: '3px 3px 0 0' },
      }}
    />
  )
}

export function DailyUsageChart({
  daily,
  metric,
  colors,
}: {
  daily: DailyUsage[]
  metric: MetricKey
  colors: Map<string, string>
}) {
  const { c } = useDocsTheme()
  const max = Math.max(...daily.map((day) => metricValue(day, metric)), 0)
  const tickEvery = Math.max(1, Math.ceil(daily.length / MAX_TICK_LABELS))

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: CHART_HEIGHT,
            flexShrink: 0,
          }}
        >
          {[max, max / 2, 0].map((tick, index) => (
            <Typography key={index} sx={{ fontSize: fontSizes.tiny, color: c.textMuted }}>
              {formatCompact(Math.round(tick))}
            </Typography>
          ))}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 0.5,
            height: CHART_HEIGHT,
            flex: 1,
            minWidth: 0,
            borderBottom: `1px solid ${c.border}`,
            borderLeft: `1px solid ${c.border}`,
            px: 0.5,
          }}
        >
          {daily.map((day) => {
            const total = metricValue(day, metric)
            const height = max > 0 ? (total / max) * 100 : 0
            const segments = day.models.filter((model) => modelMetricValue(model, metric) > 0)

            return (
              <Tooltip
                key={day.date}
                arrow
                placement="top"
                title={<BarTooltip day={day} metric={metric} />}
              >
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    cursor: 'default',
                    '&:hover': { bgcolor: c.surfaceHover },
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: `${height}%`,
                      minHeight: total > 0 ? 2 : 0,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '3px 3px 0 0',
                      overflow: 'hidden',
                    }}
                  >
                    {segments.map((model) => (
                      <Segment
                        key={`${model.provider}/${model.model}`}
                        model={model}
                        share={modelMetricValue(model, metric) / total}
                        colors={colors}
                      />
                    ))}
                  </Box>
                </Box>
              </Tooltip>
            )
          })}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5, pl: '3.5rem', pr: 0.5, mt: 0.75 }}>
        {daily.map((day, index) => (
          <Typography
            key={day.date}
            sx={{
              flex: 1,
              minWidth: 0,
              textAlign: 'center',
              fontSize: fontSizes.tiny,
              color: c.textMuted,
              whiteSpace: 'nowrap',
            }}
          >
            {index % tickEvery === 0 ? formatShortDate(day.date) : ''}
          </Typography>
        ))}
      </Box>
    </Box>
  )
}
