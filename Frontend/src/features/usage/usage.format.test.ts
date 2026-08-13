import { describe, expect, it } from 'vitest'
import {
  computeDelta,
  formatCompact,
  formatLongDate,
  formatPercent,
  formatShortDate,
  metricValue,
  monthLabel,
  weekdayOf,
} from './usage.format'

describe('formatCompact', () => {
  it('leaves values under a thousand alone', () => {
    expect(formatCompact(0)).toBe('0')
    expect(formatCompact(999)).toBe('999')
  })

  it('abbreviates thousands and millions', () => {
    expect(formatCompact(1_200)).toBe('1.2k')
    expect(formatCompact(2_400_000)).toBe('2.4M')
  })

  it('drops a trailing zero decimal', () => {
    expect(formatCompact(2_000)).toBe('2k')
  })
})

describe('formatPercent', () => {
  it('signs a rise and leaves a fall negative', () => {
    expect(formatPercent(50)).toBe('+50%')
    expect(formatPercent(-70.3)).toBe('-70.3%')
  })

  it('returns null when there is no comparable previous value', () => {
    expect(formatPercent(null)).toBeNull()
  })
})

describe('date formatting', () => {
  it('reads the calendar label without going through Date', () => {
    expect(formatShortDate('2026-08-09')).toBe('8/9')
    expect(formatLongDate('2026-08-09')).toBe('Aug 9, 2026')
    expect(monthLabel('2026-01-31')).toBe('Jan')
  })

  it('resolves the weekday for heatmap alignment', () => {
    expect(weekdayOf('2026-08-09')).toBe(0)
    expect(weekdayOf('2026-08-10')).toBe(1)
  })
})

describe('metricValue', () => {
  const day = { requests: 4, totalTokens: 120 }

  it('reads the field the toggle selects', () => {
    expect(metricValue(day, 'tokens')).toBe(120)
    expect(metricValue(day, 'requests')).toBe(4)
  })
})

describe('computeDelta', () => {
  it('matches the backend rule for a rise and a fall', () => {
    expect(computeDelta(150, 100)).toEqual({
      direction: 'up',
      percent: 50,
      previousTokens: 100,
    })
    expect(computeDelta(50, 100).direction).toBe('down')
  })

  it('treats two empty periods as flat', () => {
    expect(computeDelta(0, 0)).toEqual({
      direction: 'flat',
      percent: 0,
      previousTokens: 0,
    })
  })

  it('omits the percentage when the previous period was empty', () => {
    expect(computeDelta(500, 0).percent).toBeNull()
  })
})
