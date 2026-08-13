import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import type { UsageDashboard } from '../lib/usage'
import { REQUEST_ERRORS } from '../features/usage/usage.constants'
import Usage, { EMPTY_STATE_TITLE } from './Usage'

const fetchUsageDashboardMock = vi.fn()

vi.mock('../lib/usage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/usage')>()),
  fetchUsageDashboard: (...args: unknown[]) => fetchUsageDashboardMock(...args),
}))

const GROQ = { provider: 'groq', model: 'llama-3.1-8b-instant', requests: 3, totalTokens: 300 }
const GEMINI = { provider: 'gemini', model: 'gemini-flash-latest', requests: 1, totalTokens: 900 }

function day(date: string, totalTokens: number, previousTokens: number, models = [GROQ]) {
  return {
    date,
    requests: 2,
    promptTokens: Math.round(totalTokens / 3),
    outputTokens: Math.round((totalTokens * 2) / 3),
    totalTokens,
    models,
    delta: {
      direction:
        totalTokens === previousTokens ? 'flat' : totalTokens > previousTokens ? 'up' : 'down',
      percent: previousTokens === 0 ? null : 50,
      previousTokens,
    },
  } as UsageDashboard['daily'][number]
}

const DASHBOARD: UsageDashboard = {
  period: '7d',
  from: '2026-08-07',
  to: '2026-08-13',
  totals: { requests: 4, promptTokens: 400, outputTokens: 800, totalTokens: 1200 },
  previousTotals: { requests: 2, promptTokens: 200, outputTokens: 400, totalTokens: 600 },
  delta: { direction: 'up', percent: 100, previousTokens: 600 },
  daily: [day('2026-08-12', 300, 0), day('2026-08-13', 900, 300, [GROQ, GEMINI])],
  models: [GEMINI, GROQ],
  activity: [
    { date: '2026-08-12', requests: 3, totalTokens: 300 },
    { date: '2026-08-13', requests: 1, totalTokens: 900 },
  ],
  activityStats: {
    longestStreak: 2,
    currentStreak: 2,
    avgPerDay: 600,
    avgPerWeek: 4200,
    total: 1200,
  },
}

const EMPTY: UsageDashboard = {
  ...DASHBOARD,
  totals: { requests: 0, promptTokens: 0, outputTokens: 0, totalTokens: 0 },
  previousTotals: { requests: 0, promptTokens: 0, outputTokens: 0, totalTokens: 0 },
  delta: { direction: 'flat', percent: 0, previousTokens: 0 },
  daily: [],
  models: [],
  activity: [],
  activityStats: {
    longestStreak: 0,
    currentStreak: 0,
    avgPerDay: 0,
    avgPerWeek: 0,
    total: 0,
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  localStorage.setItem(
    'ai-router-session',
    JSON.stringify({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { id: 'u1', name: 'Gokulkrishna A B', email: 'gokul@example.com' },
    }),
  )
  fetchUsageDashboardMock.mockResolvedValue(DASHBOARD)
})

describe('Usage page', () => {
  it('requests the default 7 day window on mount', async () => {
    renderWithProviders(<Usage />)

    await waitFor(() => expect(fetchUsageDashboardMock).toHaveBeenCalledWith('7d'))
  })

  it('shows the profile, the token total and the period delta', async () => {
    renderWithProviders(<Usage />)

    expect(await screen.findByText('Gokulkrishna A B')).toBeInTheDocument()
    expect(screen.getByText('gokul@example.com')).toBeInTheDocument()
    expect(screen.getByText('1,200')).toBeInTheDocument()
    expect(screen.getByText('+100% vs prev period')).toBeInTheDocument()
  })

  it('lists each date with its own trend against the previous date', async () => {
    renderWithProviders(<Usage />)

    const latest = (await screen.findByText('Aug 13, 2026')).closest('button') as HTMLElement
    const earlier = screen.getByText('Aug 12, 2026').closest('button') as HTMLElement

    expect(within(latest).getByText('900')).toBeInTheDocument()
    expect(within(latest).getByText('+50%')).toBeInTheDocument()
    expect(within(earlier).getByText('300')).toBeInTheDocument()
    expect(within(earlier).getByText('new')).toBeInTheDocument()
  })

  it('shows the newest date first in the breakdown', async () => {
    renderWithProviders(<Usage />)

    await screen.findByText('Aug 13, 2026')
    const dates = screen.getAllByText(/Aug \d+, 2026/).map((node) => node.textContent)

    expect(dates.indexOf('Aug 13, 2026')).toBeLessThan(dates.indexOf('Aug 12, 2026'))
  })

  it('switches the displayed metric without refetching', async () => {
    const { user } = renderWithProviders(<Usage />)

    await screen.findByText('1,200')
    await user.click(screen.getByRole('button', { name: 'Requests' }))

    expect(await screen.findByText('4')).toBeInTheDocument()
    expect(fetchUsageDashboardMock).toHaveBeenCalledTimes(1)
  })

  it('refetches when the period changes', async () => {
    const { user } = renderWithProviders(<Usage />)

    await screen.findByText('1,200')
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Last 30 Days' }))

    await waitFor(() => expect(fetchUsageDashboardMock).toHaveBeenCalledWith('30d'))
  })

  it('renders the activity streak stats', async () => {
    renderWithProviders(<Usage />)

    expect(await screen.findByText('Longest streak')).toBeInTheDocument()
    expect(screen.getAllByText('2 days').length).toBeGreaterThan(0)
  })

  it('prompts the user to chat when there is no usage yet', async () => {
    fetchUsageDashboardMock.mockResolvedValue(EMPTY)
    renderWithProviders(<Usage />)

    expect(await screen.findByText(EMPTY_STATE_TITLE)).toBeInTheDocument()
  })

  it('offers a retry when the request fails', async () => {
    fetchUsageDashboardMock.mockRejectedValueOnce(new Error('network down'))
    const { user } = renderWithProviders(<Usage />)

    expect(await screen.findByText(REQUEST_ERRORS.load)).toBeInTheDocument()

    fetchUsageDashboardMock.mockResolvedValue(DASHBOARD)
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText('1,200')).toBeInTheDocument()
  })
})
