import { parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import React, { useMemo } from 'react'
import {
  ComposedChart,
  Bar,
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

interface Props {
  report: SegmentReportBasedOnDays
  timezone?: string
}

/**
 * Funnel stages:
 * 1. Started: any WORK segment (potential pomodoro start)
 * 2. Short break: WORK followed by SHORT
 * 3. Second work: SHORT followed by WORK
 * 4. Completed: WORK (second) followed by SHORT (i.e., closed cycle)
 */
type FunnelRawCounts = {
  started: number
  shortBreak: number
  secondWork: number
  completed: number
}

type FunnelChartItem = {
  stage: 'Started' | 'Short break' | 'Second work' | 'Completed'
  count: number
  conversion?: number // percentage relative to previous stage (0-100)
}

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

const buildPomodoroFunnelCounts = (
  report: SegmentReportBasedOnDays,
  timezone: string
): FunnelRawCounts => {
  let started = 0
  let shortBreak = 0
  let secondWork = 0
  let completed = 0

  for (const dayEntry of report) {
    // collect and sort local-time segments for that day
    const localDay = parseISO(dayEntry.day)
    const entries: { type: string; datetime: Date }[] = []

    for (const seg of dayEntry.segments as Segment[]) {
      const createdAtStr = getCreatedAt(seg)
      if (!createdAtStr) {
        continue
      }
      const utc = parseISO(createdAtStr)
      const zoned = toZonedTime(utc, timezone)
      // ensure belongs to the same local day
      if (zoned.getDate() !== localDay.getDate()) {
        continue
      }
      const type = getType(seg)
      if (!type) {
        continue
      }
      entries.push({ type, datetime: zoned })
    }

    entries.sort((a, b) => a.datetime.getTime() - b.datetime.getTime())

    let i = 0
    while (i < entries.length) {
      const current = entries[i]
      if (current.type === 'WORK') {
        started += 1
        if (i + 1 < entries.length && entries[i + 1].type === 'SHORT') {
          shortBreak += 1
          if (i + 2 < entries.length && entries[i + 2].type === 'WORK') {
            secondWork += 1
            if (i + 3 < entries.length && entries[i + 3].type === 'SHORT') {
              completed += 1
              i += 4
              continue
            }
            i += 3
            continue
          }
          i += 2
          continue
        }
        i += 1
        continue
      }
      i += 1
    }
  }

  return { started, shortBreak, secondWork, completed }
}

type TooltipPayloadItem = {
  dataKey?: string
  name?: string
  value?: number
  payload?: FunnelChartItem
  color?: string
}

interface FunnelTooltipProps {
  active?: boolean
  label?: string
  payload?: TooltipPayloadItem[]
}

const FunnelTooltip: React.FC<FunnelTooltipProps> = ({ active, label, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const item = payload[0].payload
  if (!item) {
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
        <div style={ { fontWeight: 600, marginBottom: 6 } }>
          { label }
        </div>
      ) }
      <div>
        <strong>{ item.stage }</strong>
      </div>
      <div>
        <span>Count: </span>
        <span>{ item.count }</span>
      </div>
      { typeof item.conversion === 'number' && (
        <div>
          <span>Conversion: </span>
          <span>{ item.conversion.toFixed(1) }%</span>
        </div>
      ) }
    </div>
  )
}

export function PomodoroFunnelChart ({ report, timezone = DEFAULT_TIMEZONE }: Props) {
  const funnelData: FunnelChartItem[] = useMemo(() => {
    const counts = buildPomodoroFunnelCounts(report, timezone)
    const stages: FunnelChartItem[] = [
      { stage: 'Started', count: counts.started },
      {
        stage: 'Short break',
        count: counts.shortBreak,
        conversion: counts.started > 0 ? (counts.shortBreak / counts.started) * 100 : 0,
      },
      {
        stage: 'Second work',
        count: counts.secondWork,
        conversion: counts.shortBreak > 0 ? (counts.secondWork / counts.shortBreak) * 100 : 0,
      },
      {
        stage: 'Completed',
        count: counts.completed,
        conversion: counts.secondWork > 0 ? (counts.completed / counts.secondWork) * 100 : 0,
      },
    ]
    return stages
  }, [report, timezone])

  return (
    <ResponsiveContainer width="100%" height={ 200 }>
      <ComposedChart
        data={ funnelData }
        margin={ {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        } }
      >
        <CartesianGrid stroke="#f5f5f5"/>
        <XAxis dataKey="stage"/>
        <YAxis
          yAxisId="left"
          label={ { value: 'Sessions', angle: -90, position: 'insideLeft' } }
          allowDecimals={ false }
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={ { value: 'Conversion %', angle: 90, position: 'insideRight' } }
          domain={ [0, 100] }
          tickFormatter={ (v) => `${ v }%` }
        />
        <Tooltip content={ <FunnelTooltip/> }/>
        <Legend/>
        <Bar
          dataKey="count"
          name="Count"
          barSize={ 30 }
          fill="#413ea0"
          yAxisId="left"
          isAnimationActive={ false }
        />
        <Line
          type="monotone"
          dataKey="conversion"
          name="Conversion"
          stroke="#ff7300"
          yAxisId="right"
          dot={ { r: 4 } }
          activeDot={ { r: 6 } }
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

PomodoroFunnelChart.displayName = 'PomodoroFunnelChart'
