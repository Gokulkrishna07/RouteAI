import { Box, Typography } from '@mui/material'
import { fontSizes } from '../../../constants'
import { useDocsTheme } from '../../../docs/DocsLayout'
import type { MetricKey, ModelUsage } from '../../../lib/usage'
import { colorFor } from '../usage.colors'
import { TOP_MODELS_LIMIT } from '../usage.constants'
import { formatNumber, modelMetricValue } from '../usage.format'

export function TopModelsList({
  models,
  metric,
  colors,
}: {
  models: ModelUsage[]
  metric: MetricKey
  colors: Map<string, string>
}) {
  const { c } = useDocsTheme()
  const ranked = [...models]
    .sort((a, b) => modelMetricValue(b, metric) - modelMetricValue(a, metric))
    .slice(0, TOP_MODELS_LIMIT)
  const max = Math.max(...ranked.map((model) => modelMetricValue(model, metric)), 0)

  if (ranked.length === 0) {
    return (
      <Typography sx={{ fontSize: fontSizes.small, color: c.textMuted }}>
        No models used in this period.
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {ranked.map((model) => {
        const value = modelMetricValue(model, metric)

        return (
          <Box key={`${model.provider}/${model.model}`}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 1,
                mb: 0.75,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: fontSizes.small,
                    fontWeight: 600,
                    color: c.textPrimary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {model.model}
                </Typography>
                <Typography
                  sx={{ fontSize: fontSizes.tiny, color: c.textMuted, flexShrink: 0 }}
                >
                  {model.provider}
                </Typography>
              </Box>
              <Typography
                sx={{ fontSize: fontSizes.small, color: c.textSecondary, flexShrink: 0 }}
              >
                {formatNumber(value)}
              </Typography>
            </Box>
            <Box sx={{ height: 4, borderRadius: 2, bgcolor: c.surfaceHover, overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  width: max > 0 ? `${(value / max) * 100}%` : 0,
                  bgcolor: colorFor(colors, model),
                  borderRadius: 2,
                }}
              />
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
