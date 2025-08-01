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
  Legend,
  ResponsiveContainer,
} from 'recharts'

import type { Segment } from '~/@types/types.db'
import { SegmentReportBasedOnDays } from '~/utils/supabase/queries/segments.query'

const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

type GapCategory = 'WORK_TO_WORK' | 'WORK_SHORT_WORK'

interface Props {
  report: SegmentReportBasedOnDays
  timezone?: string
}

/** One histogram bucket item combining both categories */
type GapHistogramItem = {
  bucket: string
  WORK_TO_WORK: number
  WORK_SHORT_WORK: number
}

type RawSegment = {
  type: string
  start: Date
  end: Date
}

// bucket definitions in minutes
const GAP_BUCKETS: Array<{ label: string; min: number; max?: number }> = [
  { label: '0-5m', min: 0, max: 5 },
  { label: '5-15m', min: 5, max: 15 },
  { label: '15-30m', min: 15, max: 30 },
  { label: '30-60m', min: 30, max: 60 },
  { label: '1h+', min: 60 },
]

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

const getDurationSeconds = (seg: unknown): number => {
  if (!isObject(seg)) {
    return 0
  }
  const d = seg['duration']
  return typeof d === 'number' ? d : 0
}

/**
 * Build histogram of gaps (in minutes) for two categories:
 * - WORK_TO_WORK: gap between end of a WORK and start of next WORK with no SHORT in between
 * - WORK_SHORT_WORK: gap between end of a SHORT that followed a WORK and start of next WORK
 */
const buildGapHistogram = (
  report: SegmentReportBasedOnDays,
  timezone: string
): GapHistogramItem[] => {
  // initialize counts per bucket
  const bucketMap: Record<string, { WORK_TO_WORK: number; WORK_SHORT_WORK: number }> = {}
  GAP_BUCKETS.forEach((b) => {
    bucketMap[b.label] = { WORK_TO_WORK: 0, WORK_SHORT_WORK: 0 }
  })

  for (const dayEntry of report) {
    // collect segments for the day with local times
    const localDay = parseISO(dayEntry.day)
    const segments: RawSegment[] = []

    for (const seg of dayEntry.segments as Segment[]) {
      const createdAtStr = getCreatedAt(seg)
      const typeRaw = getType(seg)
      if (!createdAtStr || !typeRaw) {
        continue
      }
      const utc = parseISO(createdAtStr)
      const zoned = toZonedTime(utc, timezone)

      // ensure belongs to same local day
      if (zoned.getDate() !== localDay.getDate()) {
        continue
      }

      const durationSeconds = getDurationSeconds(seg)
      const end = new Date(zoned.getTime() + durationSeconds * 1000)
      segments.push({
        type: typeRaw,
        start: zoned,
        end,
      })
    }

    // sort by start time
    segments.sort((a, b) => a.start.getTime() - b.start.getTime())

    // iterate and detect gaps
    let lastWork: RawSegment | null = null
    let lastShortAfterWork: RawSegment | null = null

    for (const seg of segments) {
      if (seg.type === 'WORK') {
        if (lastShortAfterWork) {
          // sequence WORK -> SHORT -> WORK
          const gapMinutes = (seg.start.getTime() - lastShortAfterWork.end.getTime()) / 60000
          if (gapMinutes >= 0) {
            const bucket = GAP_BUCKETS.find((b) =>
              b.max !== undefined
                ? gapMinutes >= b.min && gapMinutes < b.max
                : gapMinutes >= b.min
            )
            if (bucket) {
              bucketMap[bucket.label].WORK_SHORT_WORK += 1
            }
          }
          // consume chain, reset lastShortAfterWork and update lastWork
          lastShortAfterWork = null
          lastWork = seg
          continue
        }

        if (lastWork) {
          // direct WORK -> WORK gap
          const gapMinutes = (seg.start.getTime() - lastWork.end.getTime()) / 60000
          if (gapMinutes >= 0) {
            const bucket = GAP_BUCKETS.find((b) =>
              b.max !== undefined
                ? gapMinutes >= b.min && gapMinutes < b.max
                : gapMinutes >= b.min
            )
            if (bucket) {
              bucketMap[bucket.label].WORK_TO_WORK += 1
            }
          }
        }
        // update lastWork
        lastWork = seg
        lastShortAfterWork = null
      } else if (seg.type === 'SHORT') {
        if (lastWork) {
          // potential WORK -> SHORT -> WORK chain start
          lastShortAfterWork = seg
        } else {
          // SHORT without preceding WORK doesn't count for funnel
          lastShortAfterWork = null
        }
      } else if (seg.type === 'LONG') {
        // reset context on long break
        lastWork = null
        lastShortAfterWork = null
      } else {
        // unknown type: conservative reset
        lastShortAfterWork = null
      }
    }
  }

  // assemble array for chart
  return GAP_BUCKETS.map((b) => ({
    bucket: b.label,
    WORK_TO_WORK: bucketMap[b.label].WORK_TO_WORK,
    WORK_SHORT_WORK: bucketMap[b.label].WORK_SHORT_WORK,
  }))
}

type TooltipPayloadItem = {
  dataKey?: string
  name?: string
  value?: number
  payload?: GapHistogramItem
  color?: string
}

interface CustomTooltipProps {
  active?: boolean
  label?: string
  payload?: TooltipPayloadItem[]
}

const CATEGORY_CONFIG: Record<GapCategory, { display: string; color: string }> = {
  WORK_TO_WORK: { display: 'Work → Work', color: '#413ea0' },
  WORK_SHORT_WORK: { display: 'Work → Short → Work', color: '#ff7300' },
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, label, payload }) => {
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
        border: '1px solid #999',
        padding: 10,
        fontSize: 12,
        minWidth: 160,
      } }
    >
      { label && (
        <div style={ { fontWeight: 600, marginBottom: 6 } }>{ label }</div>
      ) }
      <div style={ { marginBottom: 4 } }>
        <strong>Bucket:</strong> { item.bucket }
      </div>
      <div style={ { display: 'flex', flexDirection: 'column', gap: 4 } }>
        { (['WORK_TO_WORK', 'WORK_SHORT_WORK'] as GapCategory[]).map((cat) => (
          <div key={ cat } style={ { display: 'flex', alignItems: 'center' } }>
            <div
              style={ {
                width: 10,
                height: 10,
                backgroundColor: CATEGORY_CONFIG[cat].color,
                marginRight: 6,
                borderRadius: 2,
              } }
            />
            <div>
              <span style={ { fontWeight: 600 } }>{ CATEGORY_CONFIG[cat].display }: </span>
              <span>{ cat === 'WORK_TO_WORK' ? item.WORK_TO_WORK : item.WORK_SHORT_WORK }</span>
            </div>
          </div>
        )) }
      </div>
    </div>
  )
}

export function GapHistogramChart ({ report, timezone = DEFAULT_TIMEZONE }: Props) {
  const data: GapHistogramItem[] = useMemo(
    () => buildGapHistogram(report, timezone),
    [report, timezone]
  )

  return (
    <ResponsiveContainer width="100%" height={ 200 }>
      <BarChart
        data={ data }
        margin={ {
          top: 12,
          right: 20,
          left: 20,
          bottom: 5,
        } }
      >
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis dataKey="bucket"/>
        <YAxis allowDecimals={ false }/>
        <Tooltip content={ <CustomTooltip/> }/>
        <Legend/>
        <Bar
          dataKey="WORK_TO_WORK"
          name={ CATEGORY_CONFIG.WORK_TO_WORK.display }
          fill={ CATEGORY_CONFIG.WORK_TO_WORK.color }
          barSize={ 16 }
        />
        <Bar
          dataKey="WORK_SHORT_WORK"
          name={ CATEGORY_CONFIG.WORK_SHORT_WORK.display }
          fill={ CATEGORY_CONFIG.WORK_SHORT_WORK.color }
          barSize={ 16 }
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

GapHistogramChart.displayName = 'GapHistogramChart'
