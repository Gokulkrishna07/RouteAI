import { useMemo, useState } from 'react'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { fontSizes, ROUTES } from '../constants'
import {
  DocsShell,
  DocsThemeProvider,
  NAV_HEIGHT,
  SectionHeading,
  useDocsTheme,
} from '../docs/DocsLayout'
import { getSession } from '../lib/session'
import type { MetricKey } from '../lib/usage'
import { buildModelColors } from '../features/usage/usage.colors'
import { useUsageDashboard } from '../features/usage/useUsageDashboard'
import { ActivityHeatmap } from '../features/usage/components/ActivityHeatmap'
import { DailyBreakdownList } from '../features/usage/components/DailyBreakdownList'
import { ProfileHeader } from '../features/usage/components/ProfileHeader'
import { UsageSummaryCard } from '../features/usage/components/UsageSummaryCard'

const TOC_LINKS = [
  { label: 'Summary', href: '#summary' },
  { label: 'Daily Breakdown', href: '#daily-breakdown' },
  { label: 'Activity', href: '#activity' },
]

export const EMPTY_STATE_TITLE = 'No usage yet'

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 10,
      }}
    >
      {children}
    </Box>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { c } = useDocsTheme()

  return (
    <CenteredState>
      <Typography sx={{ fontSize: fontSizes.body, color: c.textSecondary }}>{message}</Typography>
      <Button variant="outlined" size="small" onClick={onRetry} sx={{ borderColor: c.border }}>
        Try again
      </Button>
    </CenteredState>
  )
}

function EmptyState() {
  const { c } = useDocsTheme()

  return (
    <CenteredState>
      <Typography sx={{ fontSize: fontSizes.h3, fontWeight: 700, color: c.textPrimary }}>
        {EMPTY_STATE_TITLE}
      </Typography>
      <Typography sx={{ fontSize: fontSizes.small, color: c.textSecondary, textAlign: 'center' }}>
        Send a prompt from the chat and your token usage will show up here.
      </Typography>
      <Button variant="contained" size="small" href={ROUTES.chat}>
        Open Chat
      </Button>
    </CenteredState>
  )
}

function UsageContent() {
  const { period, setPeriod, dashboard, loading, error, reload } = useUsageDashboard()
  const [metric, setMetric] = useState<MetricKey>('tokens')
  const user = getSession()?.user ?? null
  const colors = useMemo(() => buildModelColors(dashboard?.models ?? []), [dashboard])

  if (loading && !dashboard) {
    return (
      <CenteredState>
        <CircularProgress size={26} />
      </CenteredState>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={reload} />
  }

  if (!dashboard) {
    return null
  }

  const hasUsage = dashboard.totals.requests > 0 || dashboard.activityStats.total > 0

  return (
    <Box sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 120ms ease' }}>
      <ProfileHeader user={user} />

      <SectionHeading id="summary" mt={0}>
        Usage Summary
      </SectionHeading>

      {hasUsage ? (
        <UsageSummaryCard
          dashboard={dashboard}
          period={period}
          onPeriodChange={setPeriod}
          metric={metric}
          onMetricChange={setMetric}
          colors={colors}
        />
      ) : (
        <EmptyState />
      )}

      {hasUsage ? (
        <>
          <SectionHeading id="daily-breakdown">Daily Breakdown</SectionHeading>
          <DailyBreakdownList daily={dashboard.daily} metric={metric} colors={colors} />

          <SectionHeading id="activity">Activity</SectionHeading>
          <ActivityHeatmap
            activity={dashboard.activity}
            stats={dashboard.activityStats}
            metric={metric}
          />
        </>
      ) : null}
    </Box>
  )
}

function Usage() {
  return (
    <DocsThemeProvider>
      <DocsShell tocLinks={TOC_LINKS} ctaLabel="Open Chat" ctaHref={ROUTES.chat}>
        <Box sx={{ pt: `${NAV_HEIGHT / 8}px` }}>
          <UsageContent />
        </Box>
      </DocsShell>
    </DocsThemeProvider>
  )
}

export default Usage
