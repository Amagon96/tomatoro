import { parseISO, format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

import type { Segment } from '~/@types/types.db'
import { SegmentReportBasedOnDays } from '~/utils/supabase/queries/segments.query'

const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

type PerformanceBlock = {
  block: string // e.g. "8am-10am"
  Average: number
  [dayOrKey: string]: number | string // day short names ("Mon", etc.) and Average; block is string
}

interface Props {
  report: SegmentReportBasedOnDays
  timezone?: string
}

/** Helpers */
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

/** Format hour like "8am", "12pm" */
const formatHourLabel = (hour: number): string => {
  if (hour === 0) {
    return '12am'
  }
  if (hour < 12) {
    return `${ hour }am`
  }
  if (hour === 12) {
    return '12pm'
  }
  return `${ hour - 12 }pm`
}

/**
 * Build performance data by 2-hour block, trimmed to global earliest/latest WORK hours.
 */
const buildPerformanceData = (
  report: SegmentReportBasedOnDays,
  timezone: string
): { data: PerformanceBlock[]; dayNames: string[] } => {
  // sort so day order is stable
  const sorted = [...report].sort((a, b) => parseISO(a.day).getTime() - parseISO(b.day).getTime())
  const dayNames = sorted.map((d) => format(parseISO(d.day), 'EEE')) // e.g., "Mon"

  // prepare counts: dayName -> 12 blocks (each 2h)
  const countsPerDay: Record<string, number[]> = {}
  dayNames.forEach((dn) => {
    countsPerDay[dn] = Array.from({ length: 12 }, () => 0)
  })

  // track global earliest/latest WORK hour
  let minHour = 24
  let maxHour = -1

  for (let i = 0; i < sorted.length; i++) {
    const dayEntry = sorted[i]
    const localDay = parseISO(dayEntry.day)
    const dayName = dayNames[i]

    for (const seg of dayEntry.segments as Segment[]) {
      const createdAtStr = getCreatedAt(seg)
      if (!createdAtStr) {
        continue
      }
      const type = getType(seg)
      if (type !== 'WORK') {
        continue
      }

      const utc = parseISO(createdAtStr)
      const zoned = toZonedTime(utc, timezone)

      if (zoned.getDate() !== localDay.getDate()) {
        continue
      }

      const hour = zoned.getHours() // 0..23
      minHour = Math.min(minHour, hour)
      maxHour = Math.max(maxHour, hour)

      const blockIndex = Math.floor(hour / 2) // 0..11
      countsPerDay[dayName][blockIndex] += 1
    }
  }

  // fallback limits if no data or insufficient
  if (maxHour === -1 || minHour > maxHour) {
    minHour = 9
    maxHour = 17
  }

  const earliestBlockIndex = Math.floor(minHour / 2)
  let latestBlockIndex: number
  if (maxHour === 0) {
    latestBlockIndex = 0
  } else {
    latestBlockIndex = Math.floor((maxHour - 1) / 2)
  }

  // Build blocks only within [earliestBlockIndex, latestBlockIndex]
  const blocks: PerformanceBlock[] = []
  for (let blockIndex = earliestBlockIndex; blockIndex <= latestBlockIndex; blockIndex++) {
    const startHour = blockIndex * 2
    const endHour = (startHour + 2) % 24
    const label = `${ formatHourLabel(startHour) }-${ formatHourLabel(endHour) }`

    // Average across days (if there are days)
    let sum = 0
    dayNames.forEach((dn) => {
      sum += countsPerDay[dn][blockIndex] ?? 0
    })
    const average = dayNames.length > 0 ? sum / dayNames.length : 0

    const entry: PerformanceBlock = {
      block: label,
      Average: parseFloat(average.toFixed(2)),
    }

    dayNames.forEach((dn) => {
      entry[dn] = countsPerDay[dn][blockIndex] ?? 0
    })

    blocks.push(entry)
  }

  return { data: blocks, dayNames }
}

/** Tooltip */
interface CustomTooltipProps {
  active?: boolean
  label?: string
  payload?: Array<{
    dataKey?: string
    name?: string
    value?: number | string
    payload?: PerformanceBlock
    color?: string
  }>
  dayNames: string[]
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, dayNames, label, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }
  const datum = payload[0].payload as PerformanceBlock | undefined
  if (!datum) {
    return null
  }

  return (
    <div
      style={ {
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        padding: 10,
        fontSize: 12,
        minWidth: 160,
      } }
    >
      { label && (
        <div style={ { fontWeight: 600, marginBottom: 6 } }>{ label }</div>
      ) }
      <div style={ { marginBottom: 4 } }>
        <strong>Block:</strong> { datum.block }
      </div>
      <div style={ { marginBottom: 4 } }>
        <strong>Average WORKs:</strong> { datum.Average }
      </div>
      { dayNames.map((dn) => {
        const val = datum[dn]
        if (typeof val !== 'number') {
          return null
        }
        return (
          <div key={ dn } style={ { display: 'flex', gap: 6 } }>
            <div style={ { fontWeight: 600 } }>{ dn }:</div>
            <div>{ val }</div>
          </div>
        )
      }) }
    </div>
  )
}

/** Colors for lines */
const DAY_COLOR_PALETTE = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#8dd1e1',
  '#a4de6c',
  '#d0ed57',
]

export function WorkPerformanceWithinDayChart ({
  report,
  timezone = DEFAULT_TIMEZONE,
}: Props) {
  const { data, dayNames } = useMemo(
    () => buildPerformanceData(report, timezone),
    [report, timezone]
  )

  return (
    <ResponsiveContainer width="100%" height={ 200 }>
      <LineChart
        data={ data }
        margin={ {
          top: 12,
          right: 20,
          bottom: 12,
          left: 0,
        } }
      >
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis dataKey="block"/>
        <YAxis
          allowDecimals={ false }
          label={ { value: 'WORK segments', angle: -90, position: 'insideLeft' } }
        />
        <Tooltip content={ <CustomTooltip dayNames={ dayNames }/> }/>
        <Legend/>
        { dayNames.map((dn, idx) => (
          <Line
            key={ dn }
            type="monotone"
            dataKey={ dn }
            name={ dn }
            stroke={ DAY_COLOR_PALETTE[idx % DAY_COLOR_PALETTE.length] }
            strokeWidth={ 2 }
            dot={ { r: 3 } }
            activeDot={ { r: 5 } }
            isAnimationActive={ false }
          />
        )) }
        <Line
          type="monotone"
          dataKey="Average"
          name="Average"
          stroke="#000"
          strokeWidth={ 3 }
          dot={ false }
          strokeDasharray="5 5"
          isAnimationActive={ false }
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

WorkPerformanceWithinDayChart.displayName = 'WorkPerformanceWithinDayChart'
