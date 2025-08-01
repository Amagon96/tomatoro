import { parseISO, format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import React, { useMemo } from 'react'
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Scatter,
  ResponsiveContainer,
} from 'recharts'

import type { Segment } from '~/@types/types.db'
import { SegmentReportBasedOnDays } from '~/utils/supabase/queries/segments.query'

const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

type ChartItem = {
  day: string // e.g., "Mon"
  totalSegments: number
  cumulativeSegments: number
  streak: number
  active: number // 1 or 0
}

interface Props {
  report: SegmentReportBasedOnDays
  timezone?: string
  minWorkForActive?: number
}

// type guards / accessors
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

const getCreatedAt = (seg: unknown): string | null => {
  if (!isObject(seg)) {
    return null
  }
  const ca = seg['created_at']
  return typeof ca === 'string' ? ca : null
}

const getType = (seg: unknown): string | null => {
  if (!isObject(seg)) {
    return null
  }
  const t = seg['type']
  return typeof t === 'string' ? t.toUpperCase() : null
}

const buildActivityStreakData = (
  report: SegmentReportBasedOnDays,
  timezone: string,
  minWorkForActive: number
): ChartItem[] => {
  const sorted = [...report].sort((a, b) => {
    return parseISO(a.day).getTime() - parseISO(b.day).getTime()
  })

  let cumulative = 0
  let currentStreak = 0
  const result: ChartItem[] = []

  for (const dayEntry of sorted) {
    const localDay = parseISO(dayEntry.day)
    const dayNameShort = format(localDay, 'EEE') // Mon, Tue, etc.

    let totalSegments = 0
    let workCount = 0

    for (const seg of dayEntry.segments as Segment[]) {
      const createdAtStr = getCreatedAt(seg)
      if (!createdAtStr) {
        continue
      }
      const utc = parseISO(createdAtStr)
      const zoned = toZonedTime(utc, timezone)

      if (zoned.getDate() !== localDay.getDate()) {
        continue
      }

      totalSegments += 1
      const type = getType(seg)
      if (type === 'WORK') {
        workCount += 1
      }
    }

    const active = workCount >= minWorkForActive ? 1 : 0
    const weekday = localDay.getDay() // 0 = Sunday, 6 = Saturday
    const isWeekend = weekday === 0 || weekday === 6

    if (!isWeekend) {
      if (active) {
        currentStreak += 1
      } else {
        currentStreak = 0
      }
    }

    cumulative += totalSegments

    result.push({
      day: dayNameShort,
      totalSegments,
      cumulativeSegments: cumulative,
      streak: currentStreak,
      active,
    })
  }

  return result
}

type TooltipPayloadItem = {
  dataKey?: string
  name?: string
  value?: number
  payload?: ChartItem
  color?: string
}

interface CustomTooltipProps {
  active?: boolean
  label?: string
  payload?: TooltipPayloadItem[]
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, label, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const item = payload[0].payload
  return (
    <div
      style={ {
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        padding: 10,
        fontSize: 12,
        minWidth: 140,
      } }
    >
      { label && (
        <div style={ { fontWeight: 600, marginBottom: 6 } }>
          { label }
        </div>
      ) }
      { item && (
        <>
          <div>
            <strong>Total segments:</strong> { item.totalSegments }
          </div>
          <div>
            <strong>Streak:</strong> { item.streak }
          </div>
          <div>
            <strong>Cumulative:</strong> { item.cumulativeSegments }
          </div>
          <div>
            <strong>Active:</strong> { item.active === 1 ? 'Yes' : 'No' }
          </div>
        </>
      ) }
    </div>
  )
}

export function ActivityStreakChart ({
  minWorkForActive = 1,
  report,
  timezone = DEFAULT_TIMEZONE,
}: Props) {
  const data: ChartItem[] = useMemo(
    () => buildActivityStreakData(report, timezone, minWorkForActive),
    [report, timezone, minWorkForActive]
  )

  return (
    <ResponsiveContainer width="100%" height={ 200 }>
      <ComposedChart
        data={ data }
        margin={ {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        } }
      >
        <CartesianGrid stroke="#f5f5f5"/>
        <XAxis dataKey="day"/>
        <YAxis
          yAxisId="left"
          label={ { value: 'Segments', angle: -90, position: 'insideLeft' } }
          allowDecimals={ false }
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={ { value: 'Streak', angle: 90, position: 'insideRight' } }
          allowDecimals={ false }
          domain={ [0, 'dataMax'] }
        />
        <Tooltip content={ <CustomTooltip/> }/>
        <Legend/>
        <Area
          type="monotone"
          dataKey="cumulativeSegments"
          fill="#8884d8"
          stroke="#8884d8"
          name="Cumulative"
          yAxisId="left"
        />
        <Bar
          dataKey="totalSegments"
          barSize={ 20 }
          fill="#413ea0"
          name="Daily segments"
          yAxisId="left"
        />
        <Line
          type="monotone"
          dataKey="streak"
          stroke="#ff7300"
          name="Streak"
          yAxisId="right"
        />
        <Scatter
          dataKey="active"
          name="Active day"
          fill="red"
          yAxisId="right"
          legendType="circle"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

ActivityStreakChart.displayName = 'ActivityStreakChart'
