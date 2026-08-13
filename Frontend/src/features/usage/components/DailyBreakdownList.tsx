import { useState } from 'react'
import { Box, Collapse, Typography } from '@mui/material'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import { fontSizes } from '../../../constants'
import { useDocsTheme } from '../../../docs/DocsLayout'
import type { DailyUsage, MetricKey } from '../../../lib/usage'
import { colorFor } from '../usage.colors'
import {
  formatLongDate,
  formatNumber,
  metricValue,
  modelMetricValue,
} from '../usage.format'
import { TrendArrow } from './TrendArrow'

function ModelRow({
  model,
  metric,
  colors,
}: {
  model: DailyUsage['models'][number]
  metric: MetricKey
  colors: Map<string, string>
}) {
  const { c } = useDocsTheme()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: colorFor(colors, model),
          flexShrink: 0,
        }}
      />
      <Typography sx={{ fontSize: fontSizes.small, color: c.textSecondary, flex: 1, minWidth: 0 }}>
        {model.model}
      </Typography>
      <Typography sx={{ fontSize: fontSizes.small, color: c.textSecondary }}>
        {formatNumber(modelMetricValue(model, metric))}
      </Typography>
    </Box>
  )
}

function DayRow({
  day,
  metric,
  colors,
}: {
  day: DailyUsage
  metric: MetricKey
  colors: Map<string, string>
}) {
  const { c } = useDocsTheme()
  const [open, setOpen] = useState(false)
  const value = metricValue(day, metric)
  const expandable = day.models.length > 0

  return (
    <Box sx={{ borderBottom: `1px solid ${c.border}` }}>
      <Box
        component={expandable ? 'button' : 'div'}
        onClick={expandable ? () => setOpen((prev) => !prev) : undefined}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          width: '100%',
          px: 1,
          py: 1.25,
          border: 'none',
          bgcolor: 'transparent',
          textAlign: 'left',
          cursor: expandable ? 'pointer' : 'default',
          fontFamily: 'inherit',
          '&:hover': { bgcolor: expandable ? c.surfaceHover : 'transparent' },
        }}
      >
        <ExpandMoreRoundedIcon
          sx={{
            fontSize: 16,
            color: c.textMuted,
            visibility: expandable ? 'visible' : 'hidden',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 140ms ease',
          }}
        />
        <Typography sx={{ fontSize: fontSizes.small, color: c.textPrimary, flex: 1, minWidth: 0 }}>
          {formatLongDate(day.date)}
        </Typography>
        <Typography
          sx={{
            fontSize: fontSizes.small,
            fontWeight: 600,
            color: value > 0 ? c.textPrimary : c.textMuted,
            minWidth: 72,
            textAlign: 'right',
          }}
        >
          {formatNumber(value)}
        </Typography>
        <Box sx={{ minWidth: 76, display: 'flex', justifyContent: 'flex-end' }}>
          <TrendArrow delta={day.delta} />
        </Box>
      </Box>

      {expandable ? (
        <Collapse in={open} unmountOnExit>
          <Box sx={{ pl: 5, pr: 1, pb: 1.25 }}>
            {day.models.map((model) => (
              <ModelRow
                key={`${model.provider}/${model.model}`}
                model={model}
                metric={metric}
                colors={colors}
              />
            ))}
          </Box>
        </Collapse>
      ) : null}
    </Box>
  )
}

export function DailyBreakdownList({
  daily,
  metric,
  colors,
}: {
  daily: DailyUsage[]
  metric: MetricKey
  colors: Map<string, string>
}) {
  const { c } = useDocsTheme()
  const rows = [...daily].reverse()

  return (
    <Box sx={{ border: `1px solid ${c.border}`, borderRadius: 2, overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 1,
          py: 1,
          bgcolor: c.surface,
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        <Box sx={{ width: 16, flexShrink: 0 }} />
        <Typography sx={{ fontSize: fontSizes.tiny, color: c.textMuted, flex: 1 }}>DATE</Typography>
        <Typography
          sx={{ fontSize: fontSizes.tiny, color: c.textMuted, minWidth: 72, textAlign: 'right' }}
        >
          {metric === 'tokens' ? 'TOKENS' : 'REQUESTS'}
        </Typography>
        <Typography
          sx={{ fontSize: fontSizes.tiny, color: c.textMuted, minWidth: 76, textAlign: 'right' }}
        >
          VS PREV
        </Typography>
      </Box>

      {rows.map((day) => (
        <DayRow key={day.date} day={day} metric={metric} colors={colors} />
      ))}
    </Box>
  )
}
