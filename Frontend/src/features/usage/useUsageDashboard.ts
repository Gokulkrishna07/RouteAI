import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '../../lib/apiClient'
import { fetchUsageDashboard, type UsageDashboard, type UsagePeriod } from '../../lib/usage'
import { REQUEST_ERRORS } from './usage.constants'

export function useUsageDashboard(initialPeriod: UsagePeriod = '7d') {
  const [period, setPeriod] = useState<UsagePeriod>(initialPeriod)
  const [dashboard, setDashboard] = useState<UsageDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (next: UsagePeriod) => {
    setLoading(true)
    setError(null)
    try {
      setDashboard(await fetchUsageDashboard(next))
    } catch (err) {
      setError(getErrorMessage(err, REQUEST_ERRORS.load))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(period)
  }, [load, period])

  const reload = useCallback(() => load(period), [load, period])

  return { period, setPeriod, dashboard, loading, error, reload }
}
