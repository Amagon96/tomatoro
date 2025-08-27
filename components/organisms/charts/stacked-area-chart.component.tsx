import { parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import React, { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import type { Segment } from '~/@types/types.db'
import { WEEKDAY_ORDER } from '~/utils/charts'
import { SegmentReportBasedOnDays } from '~/utils/supabase/queries/segments.query'

type AggregatedDay = {
  day: string
  WORK: number
  SHORT: number
  LONG: number
}

const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

interface Props {
  report?: SegmentReportBasedOnDays
  timezone?: string
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

const normalizeType = (raw: unknown): 'WORK' | 'SHORT' | 'LONG' | null => {
  if (!isObject(raw)) {
    return null
  }
  const maybe = raw['type']
  if (typeof maybe !== 'string') {
    return null
  }
  const upper = maybe.toUpperCase()
  if (upper === 'WORK' || upper === 'SHORT' || upper === 'LONG') {
    return upper as 'WORK' | 'SHORT' | 'LONG'
  }
  return null
}

const getCreatedAt = (raw: unknown): string | null => {
  if (!isObject(raw)) {
    return null
  }
  const ca = raw['created_at']
  if (typeof ca === 'string') {
    return ca
  }
  return null
}

const buildStackedData = (
  report: SegmentReportBasedOnDays,
  timezone: string
): AggregatedDay[] => {
  const acc: Record<string, AggregatedDay> = {}
  WEEKDAY_ORDER.forEach((dayName) => {
    acc[dayName] = {
      day: dayName,
      WORK: 0,
      SHORT: 0,
      LONG: 0,
    }
  })

  for (const dayEntry of report) {
    const localDay = parseISO(dayEntry.day)
    const dayName = WEEKDAY_ORDER[localDay.getDay()]

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

      const type = normalizeType(seg)
      if (!type) {
        continue
      }

      acc[dayName][type] += 1
    }
  }

  return WEEKDAY_ORDER.map((d) => acc[d])
}

// Tooltip types
type TooltipPayloadItem = {
  dataKey?: string
  name?: string
  value?: number
  payload?: AggregatedDay
  color?: string
}

interface CustomTooltipProps {
  active?: boolean
  label?: string
  payload?: TooltipPayloadItem[]
}

const TOOLTIP_ORDER: Array<'WORK' | 'SHORT' | 'LONG'> = ['WORK', 'SHORT', 'LONG']
const SERIES_CONFIG: Record<string, { display: string; color: string }> = {
  WORK: { display: 'Work', color: '#DA3B1B' },
  SHORT: { display: 'Short', color: '#eab440' },
  LONG: { display: 'Long', color: '#647C46' },
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, label, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const payloadMap = new Map<string, TooltipPayloadItem>()
  payload.forEach((p) => {
    if (p.dataKey) {
      payloadMap.set(p.dataKey.toUpperCase(), p)
    }
  })

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #999',
        margin: 0,
        padding: 10,
        fontSize: 12,
        minWidth: 140,
      }}
    >
      {label && (
        <div style={{ marginBottom: 6, fontWeight: 600 }}>
          {label}
        </div>
      )}
      {TOOLTIP_ORDER.map((key) => {
        const item = payloadMap.get(key)
        const config = SERIES_CONFIG[key]
        const value = item?.value ?? 0
        return (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                backgroundColor: config.color,
                marginRight: 6,
                borderRadius: 2,
              }}
            />
            <div>
              <span style={{ fontWeight: 600 }}>{config.display}: </span>
              <span>{value}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function StackedAreaChart ({ report = [], timezone = DEFAULT_TIMEZONE }: Props) {
  const data: AggregatedDay[] = useMemo(() => {
    if (!report || report.length === 0) {
      return WEEKDAY_ORDER.map((dayName) => ({
        day: dayName,
        WORK: 0,
        SHORT: 0,
        LONG: 0,
      }))
    }
    return buildStackedData(report, timezone)
  }, [report, timezone])

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        {/* stacking: LONG at bottom, then SHORT, then WORK on top */}
        <Area
          type="monotone"
          dataKey="LONG"
          stackId="1"
          stroke={SERIES_CONFIG.LONG.color}
          fill={SERIES_CONFIG.LONG.color}
          name={SERIES_CONFIG.LONG.display}
        />
        <Area
          type="monotone"
          dataKey="SHORT"
          stackId="1"
          stroke={SERIES_CONFIG.SHORT.color}
          fill={SERIES_CONFIG.SHORT.color}
          name={SERIES_CONFIG.SHORT.display}
        />
        <Area
          type="monotone"
          dataKey="WORK"
          stackId="1"
          stroke={SERIES_CONFIG.WORK.color}
          fill={SERIES_CONFIG.WORK.color}
          name={SERIES_CONFIG.WORK.display}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

StackedAreaChart.displayName = 'StackedAreaChart'
