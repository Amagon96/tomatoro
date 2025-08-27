import { parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

import type { Segment } from '~/@types/types.db'
import { SegmentReportBasedOnDays } from '~/utils/supabase/queries/segments.query'

const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

export type FocusSummary = {
  focusStreak: number // longest streak of work days; weekends (Sat/Sun) don't break
  focusLevel: number // proportion of WORK segments over total segments (0..1)
  focusTime: number // total duration in seconds of WORK segments
  // eslint-disable-next-line max-len
  recoveryTime: number // weighted average break duration (seconds) between consecutive WORK segments on the same day, weighted by previous WORK duration
  avgWorkSessionsPerDay: number // total WORK segments / number of days in report
}

type LocalizedSegment = {
  type: string
  start: Date
  end: Date
}

/**
 * Summarize focus-related metrics for a weekly report.
 */
export function summarizeFocusMetrics (
  report: SegmentReportBasedOnDays,
  timezone: string = DEFAULT_TIMEZONE
): FocusSummary {
  if (!report || report.length === 0) {
    return {
      focusStreak: 0,
      focusLevel: 0,
      focusTime: 0,
      recoveryTime: 0,
      avgWorkSessionsPerDay: 0,
    }
  }

  // helpers
  const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
  const getType = (seg: unknown): string | null => {
    if (!isObject(seg)) {
      return null
    }
    const t = seg['type']
    return typeof t === 'string' ? t.toUpperCase() : null
  }
  const getCreatedAt = (seg: unknown): string | null => {
    if (!isObject(seg)) {
      return null
    }
    const ca = seg['created_at']
    return typeof ca === 'string' ? ca : null
  }
  const getDuration = (seg: unknown): number => {
    if (!isObject(seg)) {
      return 0
    }
    const d = seg['duration']
    return typeof d === 'number' ? d : 0
  }

  // sort report days chronologically
  const sortedReport = [...report].sort((a, b) => parseISO(a.day).getTime() - parseISO(b.day).getTime())

  let workSegmentCount = 0
  let totalSegmentCount = 0
  let totalWorkTime = 0 // in seconds

  const allSegments: LocalizedSegment[] = []
  const dayWorkPresence: Array<{ date: Date; hasWork: boolean }> = []

  for (const dayEntry of sortedReport) {
    const localDay = parseISO(dayEntry.day)
    let hasWorkThisDay = false

    for (const seg of dayEntry.segments as Segment[]) {
      const createdAtStr = getCreatedAt(seg)
      const typeRaw = getType(seg)
      if (!createdAtStr || !typeRaw) {
        continue
      }

      totalSegmentCount += 1

      const utc = parseISO(createdAtStr)
      const zoned = toZonedTime(utc, timezone)
      const durationSec = getDuration(seg)
      const end = new Date(zoned.getTime() + durationSec * 1000)

      allSegments.push({
        type: typeRaw,
        start: zoned,
        end,
      })

      if (typeRaw === 'WORK') {
        workSegmentCount += 1
        totalWorkTime += durationSec
        hasWorkThisDay = true
      }
    }

    dayWorkPresence.push({
      date: localDay,
      hasWork: hasWorkThisDay,
    })
  }

  // focusLevel
  const focusLevel = totalSegmentCount > 0 ? workSegmentCount / totalSegmentCount : 0

  // avg work sessions per day
  const avgWorkSessionsPerDay = dayWorkPresence.length > 0 ? workSegmentCount / dayWorkPresence.length : 0

  // focus streak: weekends don't break or increment
  let currentStreak = 0
  let maxStreak = 0
  for (const { date, hasWork } of dayWorkPresence) {
    const weekday = date.getDay() // 0 = Sunday, 6 = Saturday
    const isWeekend = weekday === 0 || weekday === 6

    if (isWeekend) {
      continue // neither reset nor increment
    }

    if (hasWork) {
      currentStreak += 1
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak
      }
    } else {
      currentStreak = 0
    }
  }
  const focusStreak = maxStreak

  // recovery time: weighted average gap in seconds between consecutive WORK segments on the same local day,
  // weight each gap by the duration of the previous WORK segment.
  allSegments.sort((a, b) => a.start.getTime() - b.start.getTime())

  const sameLocalDay = (a: Date, b: Date): boolean =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  let prevWork: LocalizedSegment | null = null
  type GapInfo = { gapSeconds: number; prevWorkDuration: number }
  const gaps: GapInfo[] = []

  for (const seg of allSegments) {
    if (seg.type === 'WORK') {
      if (prevWork) {
        // consider only if both WORKs are on the same local day
        if (sameLocalDay(prevWork.end, seg.start)) {
          const gapSeconds = (seg.start.getTime() - prevWork.end.getTime()) / 1000
          const prevWorkDuration = (prevWork.end.getTime() - prevWork.start.getTime()) / 1000
          if (gapSeconds >= 0 && prevWorkDuration > 0) {
            gaps.push({ gapSeconds, prevWorkDuration })
          }
        }
      }
      prevWork = seg
    }
  }

  let recoveryTime = 0
  if (gaps.length > 0) {
    // weighted average: sum(gap * prevWorkDuration) / sum(prevWorkDuration)
    const totalWeight = gaps.reduce((sum, g) => sum + g.prevWorkDuration, 0)
    const weightedSum = gaps.reduce((sum, g) => sum + g.gapSeconds * g.prevWorkDuration, 0)
    recoveryTime = totalWeight > 0 ? weightedSum / totalWeight : 0
  }

  return {
    focusStreak,
    focusLevel,
    focusTime: totalWorkTime,
    recoveryTime,
    avgWorkSessionsPerDay,
  }
}
