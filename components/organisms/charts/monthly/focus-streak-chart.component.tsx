import { parseISO, format, isSameDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import React, { FC, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

import type { Segment } from '~/@types/types.db'
import { SegmentReportBasedOnDays } from '~/utils/supabase/queries/segments.query'

interface Props {
  report: SegmentReportBasedOnDays
  timezone?: string
}

type DayEntry = {
  dayLabel: string // e.g., "Mon 04"
  date: Date
  hasWork: boolean
  isWeekend: boolean
  inLongestStreak: boolean
}

const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

const isWeekendDay = (date: Date): boolean => {
  const d = date.getDay()
  return d === 0 || d === 6
}

// Safely convert various input to Date
const toDate = (input: unknown): Date | null => {
  if (input instanceof Date) {
    return input
  }
  if (typeof input === 'string') {
    const parsed = parseISO(input)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
  }
  return null
}

const getFillColor = (entry: DayEntry): string => {
  if (entry.inLongestStreak) {
    return '#4caf50' // green for longest streak days
  }
  if (entry.isWeekend && entry.hasWork) {
    return '#ffa500' // orange for weekend work (counts)
  }
  if (entry.hasWork) {
    return '#8884d8' // blue for other work days
  }
  if (entry.isWeekend) {
    return '#f5f5f5' // light for weekend no work
  }
  return '#e0e0e0' // gray for no work
}

const TooltipContent: FC<{ payload?: any; label?: string }> = ({ label, payload }) => {
  if (!payload || !payload.length) {
    return null
  }
  const entry: DayEntry = payload[0].payload
  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        padding: 10,
        fontSize: 12,
        minWidth: 160,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div>
        <strong>Date:</strong> {format(entry.date, 'PPP')}
      </div>
      <div>
        <strong>Work day:</strong> {entry.hasWork ? 'Yes' : 'No'}
      </div>
      {entry.isWeekend && (
        <div>
          <strong>Weekend:</strong> Yes
        </div>
      )}
      {entry.inLongestStreak && (
        <div>
          <strong>Part of longest streak</strong>
        </div>
      )}
    </div>
  )
}

/**
 * Focus streak chart: longest run of work days (active weekends count, inactive weekends are neutral).
 */
export const FocusStreakChart: FC<Props> = ({
  report,
  timezone = DEFAULT_TIMEZONE,
}) => {
  const { data, longestStreakLength } = useMemo(() => {
    // Build presence array
    const presence: Array<{
      date: Date
      hasWork: boolean
      isWeekend: boolean
    }> = report
      .map((dayEntry) => {
        const localDay = parseISO(dayEntry.day)
        const isWeekend = isWeekendDay(localDay)
        let hasWork = false

        for (const seg of dayEntry.segments as Segment[]) {
          if (seg.type !== 'WORK') {
            continue
          }
          const created = toDate((seg as any).created_at)
          if (!created) {
            continue
          }
          const zoned = toZonedTime(created, timezone)
          if (isSameDay(zoned, localDay)) {
            hasWork = true
            break
          }
        }

        return {
          date: localDay,
          hasWork,
          isWeekend,
        }
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    // Compute longest streak indices with updated weekend logic:
    // - Active weekend (hasWork) counts as a work day.
    // - Inactive weekend (no work) neither breaks nor increments.
    let currentStreakIndices: number[] = []
    let longestStreakIndices: number[] = []

    presence.forEach((entry, idx) => {
      if (!entry.hasWork) {
        if (entry.isWeekend) {
          // inactive weekend: skip, neither reset nor increment
          return
        }
        // weekday with no work: break streak
        currentStreakIndices = []
        return
      }
      // entry has work (weekday or active weekend)
      currentStreakIndices.push(idx)
      if (currentStreakIndices.length > longestStreakIndices.length) {
        longestStreakIndices = [...currentStreakIndices]
      }
    })

    const dayEntries: DayEntry[] = presence.map((p, idx) => ({
      dayLabel: format(p.date, 'EEE d'),
      date: p.date,
      hasWork: p.hasWork,
      isWeekend: p.isWeekend,
      inLongestStreak: longestStreakIndices.includes(idx),
    }))

    return {
      data: dayEntries,
      longestStreakLength: longestStreakIndices.length,
    }
  }, [report, timezone])

  if (!data || data.length === 0) {
    return <div>No activity to show streak.</div>
  }

  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
        Longest focus streak: {longestStreakLength} day
        {longestStreakLength !== 1 ? 's' : ''}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 12, height: 12, backgroundColor: '#4caf50', borderRadius: 2 }} />
          <div style={{ fontSize: 12 }}>Longest streak day</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 12, height: 12, backgroundColor: '#8884d8', borderRadius: 2 }} />
          <div style={{ fontSize: 12 }}>Other work day</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 12, height: 12, backgroundColor: '#ffa500', borderRadius: 2 }} />
          <div style={{ fontSize: 12 }}>Weekend work</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 12, height: 12, backgroundColor: '#e0e0e0', borderRadius: 2 }} />
          <div style={{ fontSize: 12 }}>No work</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div
            style={{
              width: 12,
              height: 12,
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
              border: '1px solid #ccc',
            }}
          />
          <div style={{ fontSize: 12 }}>Weekend (no work)</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={80}>
        <BarChart
          data={data}
          margin={{
            top: 4,
            right: 10,
            left: 0,
            bottom: 4,
          }}
        >
          <XAxis
            dataKey="dayLabel"
            tick={{ fontSize: 10 }}
            interval={0}
            height={30}
            tickLine={false}
            axisLine={false}
          />
          <YAxis hide domain={[0, 1]} />
          <Tooltip content={<TooltipContent />} />
          <Bar dataKey={() => 1} isAnimationActive={false}>
            {data.map((entry) => (
              <Cell
                key={entry.dayLabel}
                fill={getFillColor(entry)}
                stroke={entry.isWeekend && !entry.hasWork ? '#999' : undefined}
                strokeWidth={entry.isWeekend && !entry.hasWork ? 1 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

FocusStreakChart.displayName = 'FocusStreakChart'
