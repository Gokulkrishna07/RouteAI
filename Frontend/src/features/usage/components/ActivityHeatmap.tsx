import { Box, Tooltip, Typography } from '@mui/material'
import { fonts, fontSizes } from '../../../constants'
import { useDocsTheme } from '../../../docs/DocsLayout'
import type { ActivityDay, ActivityStats, MetricKey } from '../../../lib/usage'
import { HEATMAP_LEVELS } from '../usage.constants'
import {
  formatCompact,
  formatLongDate,
  formatNumber,
  metricNoun,
  metricValue,
  monthLabel,
  weekdayOf,
} from '../usage.format'

const DAYS_PER_WEEK = 7
const CELL = 11
const GAP = 3
const COLUMN = CELL + GAP
const WEEKDAY_LABELS = ['', 'M', '', 'W', '', 'F', ''] as const

type Cell = ActivityDay | null

/**
 * Pads the front of the range so every column is a real Sunday-to-Saturday week,
 * which is what makes the weekday row labels line up with the squares.
 */
function toColumns(activity: ActivityDay[]): Cell[][] {
  if (activity.length === 0) return []

  const lead: Cell[] = Array.from({ length: weekdayOf(activity[0].date) }, () => null)
  const cells: Cell[] = [...lead, ...activity]
  const columns: Cell[][] = []

  for (let index = 0; index < cells.length; index += DAYS_PER_WEEK) {
    const column = cells.slice(index, index + DAYS_PER_WEEK)
    columns.push([...column, ...Array.from({ length: DAYS_PER_WEEK - column.length }, () => null)])
  }

  return columns
}

function levelOf(value: number, max: number): number {
  if (value <= 0 || max <= 0) return 0
  return Math.min(HEATMAP_LEVELS, Math.ceil((value / max) * HEATMAP_LEVELS))
}

function Stat({ label, value }: { label: string; value: string }) {
  const { c } = useDocsTheme()

  return (
    <Box>
      <Typography sx={{ fontSize: fontSizes.tiny, color: c.textMuted, mb: 0.25 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: fonts.heading,
          fontSize: fontSizes.h3,
          fontWeight: 700,
          color: c.textPrimary,
        }}
      >
        {value}
      </Typography>
    </Box>
  )
}

export function ActivityHeatmap({
  activity,
  stats,
  metric,
}: {
  activity: ActivityDay[]
  stats: ActivityStats
  metric: MetricKey
}) {
  const { c } = useDocsTheme()
  const columns = toColumns(activity)
  const max = Math.max(...activity.map((day) => metricValue(day, metric)), 0)

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Stat label="Longest streak" value={`${stats.longestStreak} days`} />
        <Stat label="Current streak" value={`${stats.currentStreak} days`} />
        <Stat label="Avg / day" value={formatCompact(Math.round(stats.avgPerDay))} />
        <Stat label="Avg / week" value={formatCompact(Math.round(stats.avgPerWeek))} />
      </Box>

      <Box sx={{ overflowX: 'auto', pb: 1 }}>
        <Box sx={{ display: 'inline-block', minWidth: 'min-content' }}>
          <Box sx={{ display: 'flex', ml: `${CELL + GAP * 2}px`, mb: 0.5 }}>
            {columns.map((column, index) => {
              const first = column.find((cell): cell is ActivityDay => cell !== null)
              const previous = columns[index - 1]?.find(
                (cell): cell is ActivityDay => cell !== null,
              )
              const changed =
                first && (!previous || monthLabel(first.date) !== monthLabel(previous.date))

              return (
                <Typography
                  key={index}
                  sx={{
                    width: COLUMN,
                    flexShrink: 0,
                    fontSize: fontSizes.tiny,
                    color: c.textMuted,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {changed && first ? monthLabel(first.date) : ''}
                </Typography>
              )
            })}
          </Box>

          <Box sx={{ display: 'flex', gap: `${GAP}px` }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateRows: `repeat(${DAYS_PER_WEEK}, ${CELL}px)`,
                gap: `${GAP}px`,
                mr: `${GAP}px`,
              }}
            >
              {WEEKDAY_LABELS.map((label, index) => (
                <Typography
                  key={index}
                  sx={{
                    fontSize: fontSizes.tiny,
                    color: c.textMuted,
                    lineHeight: `${CELL}px`,
                  }}
                >
                  {label}
                </Typography>
              ))}
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                gridTemplateRows: `repeat(${DAYS_PER_WEEK}, ${CELL}px)`,
                gridAutoColumns: `${CELL}px`,
                gap: `${GAP}px`,
              }}
            >
              {columns.flatMap((column, columnIndex) =>
                column.map((cell, rowIndex) => {
                  if (!cell) {
                    return <Box key={`${columnIndex}-${rowIndex}`} />
                  }

                  const value = metricValue(cell, metric)
                  const level = levelOf(value, max)

                  return (
                    <Tooltip
                      key={cell.date}
                      arrow
                      placement="top"
                      title={`${formatNumber(value)} ${metricNoun(metric, value)} · ${formatLongDate(cell.date)}`}
                    >
                      <Box
                        sx={{
                          width: CELL,
                          height: CELL,
                          borderRadius: '2px',
                          bgcolor: level === 0 ? c.surfaceHover : c.accent,
                          opacity: level === 0 ? 1 : level / HEATMAP_LEVELS,
                        }}
                      />
                    </Tooltip>
                  )
                }),
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5 }}>
        <Typography sx={{ fontSize: fontSizes.tiny, color: c.textMuted, mr: 0.5 }}>Less</Typography>
        {Array.from({ length: HEATMAP_LEVELS + 1 }, (_, level) => (
          <Box
            key={level}
            sx={{
              width: CELL,
              height: CELL,
              borderRadius: '2px',
              bgcolor: level === 0 ? c.surfaceHover : c.accent,
              opacity: level === 0 ? 1 : level / HEATMAP_LEVELS,
            }}
          />
        ))}
        <Typography sx={{ fontSize: fontSizes.tiny, color: c.textMuted, ml: 0.5 }}>More</Typography>
      </Box>
    </Box>
  )
}
