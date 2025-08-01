import { parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'

import type { Segment } from '~/@types/types.db'
import { SegmentReportBasedOnDays } from '~/utils/supabase/queries/segments.query'

const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

type Metric = 'count' | 'duration'

interface Props {
  report: SegmentReportBasedOnDays
  timezone?: string
  filterType?: 'WORK' | 'SHORT' | 'LONG'
  metric?: Metric
}

type HourlyAggregate = {
  hourLabel: string // e.g., "8am"
  value: number
}

// type guards/accessors
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

const getDuration = (seg: unknown): number => {
  if (!isObject(seg)) {
    return 0
  }
  const d = seg['duration']
  return typeof d === 'number' ? d : 0
}

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

const buildHourlyProductivity = (
  report: SegmentReportBasedOnDays,
  timezone: string,
  filterType: 'WORK' | 'SHORT' | 'LONG' | undefined,
  metric: Metric
): HourlyAggregate[] => {
  const byHour: Record<number, { count: number; duration: number }> = {}

  for (const dayEntry of report) {
    const localDay = parseISO(dayEntry.day)

    for (const seg of dayEntry.segments as Segment[]) {
      const createdAtStr = getCreatedAt(seg)
      if (!createdAtStr) {
        continue
      }
      const utc = parseISO(createdAtStr)
      const zoned = toZonedTime(utc, timezone)
      // ensure segment belongs to that local day
      if (zoned.getDate() !== localDay.getDate()) {
        continue
      }

      const type = getType(seg)
      if (filterType && type !== filterType) {
        continue
      }

      const hour = zoned.getHours()
      if (!byHour[hour]) {
        byHour[hour] = { count: 0, duration: 0 }
      }
      byHour[hour].count += 1
      byHour[hour].duration += getDuration(seg)
    }
  }

  const aggregates: HourlyAggregate[] = Object.entries(byHour).map(([hourStr, agg]) => {
    const hourNum = Number(hourStr)
    return {
      hourLabel: formatHourLabel(hourNum),
      value: metric === 'duration' ? agg.duration : agg.count,
    }
  })

  // sort descending by value (most productive first)
  aggregates.sort((a, b) => b.value - a.value)

  return aggregates
}

type TooltipPayloadItem = {
  dataKey?: string
  name?: string
  value?: number
  payload?: HourlyAggregate
  color?: string
}

interface CustomTooltipProps {
  active?: boolean
  label?: string
  payload?: TooltipPayloadItem[]
  metric: Metric
  filterType?: string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, filterType, label, metric, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }
  const item = payload[0].payload
  if (!item) {
    return null
  }

  const unitLabel = metric === 'duration' ? 'Duration' : 'Segments'

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
      <div>
        <strong>{ unitLabel }:</strong> { item.value }
      </div>
      { filterType && (
        <div>
          <strong>Type:</strong> { filterType }
        </div>
      ) }
    </div>
  )
}

export function ProductiveHoursChart ({
  filterType,
  metric = 'count',
  report,
  timezone = DEFAULT_TIMEZONE,
}: Props) {
  const data: HourlyAggregate[] = useMemo(
    () => buildHourlyProductivity(report, timezone, filterType, metric),
    [report, timezone, filterType, metric]
  )

  return (
    <ResponsiveContainer width="100%" height={ 200 }>
      <BarChart
        layout="vertical"
        data={ data }
        margin={ {
          top: 10,
          right: 20,
          bottom: 10,
          left: 60,
        } }
      >
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis
          type="number"
          allowDecimals={ false }
          label={ {
            value: metric === 'duration' ? 'Total duration' : 'Total segments',
            position: 'insideBottom',
            offset: -5,
          } }
        />
        <YAxis
          dataKey="hourLabel"
          type="category"
          width={ 60 }
          tick={ { fontSize: 12 } }
          interval={ 0 }
          label={ { value: 'Hour', angle: -90, position: 'insideLeft' } }
        />
        <Tooltip
          content={ <CustomTooltip metric={ metric } filterType={ filterType }/> }
          cursor={ { fill: 'rgba(0,0,0,0.05)' } }
        />
        <Bar
          dataKey="value"
          name={ metric === 'duration' ? 'Duration' : 'Segments' }
          fill="#413ea0"
          isAnimationActive={ false }
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

ProductiveHoursChart.displayName = 'ProductiveHoursChart'
