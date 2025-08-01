import React, { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import type { Segment } from '~/@types/types.db'
import { SegmentReportBasedOnDays } from '~/utils/supabase/queries/segments.query'

type SegmentType = 'WORK' | 'SHORT' | 'LONG'

interface Props {
  report: SegmentReportBasedOnDays
  timezone?: string // preserved for signature consistency
}

type PieDataItem = {
  name: string
  value: number
  percentage: number
  type: SegmentType
}

const TYPE_DISPLAY: Record<SegmentType, string> = {
  WORK: 'Work',
  SHORT: 'Short Break',
  LONG: 'Long Break',
}

const TYPE_COLORS: Record<SegmentType, string> = {
  WORK: '#DA3B1B',
  SHORT: '#eab440',
  LONG: '#647C46',
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

const getType = (seg: unknown): string | null => {
  if (!isObject(seg)) {
    return null
  }
  const t = seg['type']
  return typeof t === 'string' ? t.toUpperCase() : null
}

const buildPieData = (report: SegmentReportBasedOnDays): PieDataItem[] => {
  const counts: Record<SegmentType, number> = {
    WORK: 0,
    SHORT: 0,
    LONG: 0,
  }

  for (const dayEntry of report) {
    for (const seg of dayEntry.segments as Segment[]) {
      const rawType = getType(seg)
      if (rawType === 'WORK' || rawType === 'SHORT' || rawType === 'LONG') {
        counts[rawType] += 1
      }
    }
  }

  const total = Object.values(counts).reduce((sum, v) => sum + v, 0)

  if (total === 0) {
    return (['WORK', 'SHORT', 'LONG'] as SegmentType[]).map((t) => ({
      name: TYPE_DISPLAY[t],
      value: 0,
      percentage: 0,
      type: t,
    }))
  }

  return (['WORK', 'SHORT', 'LONG'] as SegmentType[]).map((t) => ({
    name: TYPE_DISPLAY[t],
    value: counts[t],
    percentage: (counts[t] / total) * 100,
    type: t,
  }))
}

interface TooltipPayloadItem {
  payload?: PieDataItem
  name?: string
  value?: number
  dataKey?: string
  fill?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
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
        minWidth: 140,
        borderRadius: 4,
      } }
    >
      <div style={ { fontWeight: 600, marginBottom: 4 } }>{ item.name }</div>
      <div>
        <strong>Count:</strong> { item.value }
      </div>
      <div>
        <strong>Percentage:</strong> { item.percentage.toFixed(1) }%
      </div>
    </div>
  )
}

export function SegmentTypePieChart ({ report }: Props) {
  const data = useMemo(() => buildPieData(report), [report])

  const totalSegments = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div style={ { width: '100%', height: 200, position: 'relative' } }>
      { totalSegments === 0 && (
        <div
          style={ {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            fontSize: 14,
            color: '#666',
            background: 'rgba(255,255,255,0.8)',
            zIndex: 1,
          } }
        >
          No activity this week
        </div>
      ) }
      <ResponsiveContainer width="100%" height={ 200 }>
        <PieChart margin={ { top: 12, right: 12, bottom: 12, left: 12 } }>
          <Pie
            data={ data }
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="70%"
            paddingAngle={ 4 }
            label={ ({ name, percent }: { name: string; percent?: number }) =>
              `${ name } ${ Math.round((percent ?? 0) * 100) }%`
            }
            isAnimationActive={ false }
          >
            { data.map((entry) => (
              <Cell
                key={ `cell-${ entry.name }` }
                fill={ TYPE_COLORS[entry.type] }
                stroke={ entry.value === 0 ? 'transparent' : undefined }
              />
            )) }
          </Pie>
          <Tooltip content={ <CustomTooltip/> }/>
        </PieChart>
      </ResponsiveContainer>
      <div
        style={ {
          marginTop: 8,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          justifyContent: 'center',
          fontSize: 12,
        } }
      >
        { data.map((d) => (
          <div
            key={ d.type }
            style={ {
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              minWidth: 100,
            } }
          >
            <div
              style={ {
                width: 12,
                height: 12,
                backgroundColor: TYPE_COLORS[d.type],
                borderRadius: 2,
                flexShrink: 0,
              } }
            />
            <div>
              <div style={ { fontWeight: 600 } }>
                { d.name } { d.value > 0 ? `(${ d.value })` : '' }
              </div>
              <div>{ d.percentage.toFixed(1) }%</div>
            </div>
          </div>
        )) }
      </div>
    </div>
  )
}

SegmentTypePieChart.displayName = 'SegmentTypePieChart'
