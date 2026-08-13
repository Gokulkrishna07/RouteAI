import { Box, Typography } from '@mui/material'
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import { fontSizes } from '../../../constants'
import { useDocsTheme } from '../../../docs/DocsLayout'
import type { UsageDelta } from '../../../lib/usage'
import { formatPercent } from '../usage.format'

const ICONS = {
  up: ArrowUpwardRoundedIcon,
  down: ArrowDownwardRoundedIcon,
  flat: RemoveRoundedIcon,
} as const

/**
 * Direction carries the meaning, not colour. A quiet day is not a regression,
 * so red-for-down would editorialise usage the user has no reason to read as bad.
 */
export function TrendArrow({
  delta,
  suffix,
  size = fontSizes.small,
}: {
  delta: UsageDelta
  suffix?: string
  size?: string
}) {
  const { c } = useDocsTheme()
  const Icon = ICONS[delta.direction]
  const percent = formatPercent(delta.percent)

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.375 }}>
      <Icon sx={{ fontSize: 14, color: c.textSecondary }} />
      <Typography component="span" sx={{ fontSize: size, color: c.textSecondary }}>
        {percent ?? (delta.direction === 'up' ? 'new' : '—')}
        {suffix ? ` ${suffix}` : ''}
      </Typography>
    </Box>
  )
}
