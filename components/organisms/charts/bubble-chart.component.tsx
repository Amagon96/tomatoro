import { parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import React, { useMemo } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useThemeUI } from 'theme-ui'

import type { Segment } from '~/@types/types.db'
import { WEEKDAY_ORDER } from '~/utils/charts'
import { SegmentReportBasedOnDays } from '~/utils/supabase/queries/segments.query'

type HourlyPoint = {
  hour: string
  index: number
  value: number
}

const DEFAULT_START_HOUR = 9
const DEFAULT_END_HOUR = 17 // 5pm

const formatHourLabel = (hour: number) => {
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

const initEmptyDay = (): HourlyPoint[] =>
  Array.from({ length: 24 }, (_, h) => ({
    hour: formatHourLabel(h),
    index: 1,
    value: 0,
  }))

const buildHourlyData = (
  weeklyReport: SegmentReportBasedOnDays,
  timezone: string
): Record<string, HourlyPoint[]> => {
  const byDay: Record<string, HourlyPoint[]> = {}
  WEEKDAY_ORDER.forEach((d) => {
    byDay[d] = initEmptyDay()
  })

  for (const dayEntry of weeklyReport) {
    const localDay = parseISO(dayEntry.day)
    const dayName = WEEKDAY_ORDER[localDay.getDay()]

    for (const seg of dayEntry.segments as Segment[]) {
      const createdAt = (seg as any).created_at
      if (!createdAt) {
        continue
      }
      const utc = parseISO(createdAt)
      const zoned = toZonedTime(utc, timezone)

      // Verifica que esté en el mismo día local
      if (zoned.getDate() !== localDay.getDate()) {
        continue
      }

      const hour = zoned.getHours()
      const duration = typeof (seg as any).duration === 'number' ? (seg as any).duration : 1
      byDay[dayName][hour].value += duration
    }
  }

  return byDay
}

const computeGlobalHourBounds = (byDay: Record<string, HourlyPoint[]>) => {
  let minHour = 24
  let maxHour = -1
  Object.values(byDay).forEach((dayArray) => {
    dayArray.forEach((point, hour) => {
      if (point.value > 0) {
        if (hour < minHour) {
          minHour = hour
        }
        if (hour > maxHour) {
          maxHour = hour
        }
      }
    })
  })

  // Si no hay datos o solo una hora activa, usa el rango por defecto
  if (maxHour === -1 || maxHour - minHour < 1) {
    return [DEFAULT_START_HOUR, DEFAULT_END_HOUR] as const
  }

  return [minHour, maxHour] as const
}

const sliceByGlobalBounds = (data: HourlyPoint[], bounds: readonly [number, number]) => {
  const [minHour, maxHour] = bounds
  return data.slice(minHour, maxHour + 1)
}

const computeDomain = (datasets: HourlyPoint[][]): [number, number] => {
  const allValues = datasets.flat().map((d) => d.value)
  const max = Math.max(...allValues, 0)
  return [0, max || 1]
}

type CustomTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: HourlyPoint }>
}

const makeTooltip =
  (dayName: string) => {
    const TooltipComponent: React.FC<CustomTooltipProps> = ({ active, payload }) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
          <div
            style={ {
              backgroundColor: '#fff',
              border: '1px solid #999',
              margin: 0,
              padding: 10,
            } }
          >
            <p style={ { margin: 0, fontWeight: '600' } }>{ dayName }</p>
            <p style={ { margin: 0 } }>{ data.hour }</p>
            <p style={ { margin: 0 } }>
              <span>value: </span>
              { data.value }
            </p>
          </div>
        )
      }
      return null
    }

    TooltipComponent.displayName = `BubbleTooltip(${ dayName })`
    return TooltipComponent
  }

interface Props {
  weeklyReport?: SegmentReportBasedOnDays
  timezone?: string
}

export const BubbleChart: React.FC<Props> = ({
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  weeklyReport,
}) => {
  const { theme } = useThemeUI()

  const chartDataByDay = useMemo(() => {
    if (weeklyReport && weeklyReport.length) {
      return buildHourlyData(weeklyReport, timezone)
    }

    const empty: Record<string, HourlyPoint[]> = {}
    WEEKDAY_ORDER.forEach((d) => {
      empty[d] = initEmptyDay()
    })
    return empty
  }, [weeklyReport, timezone])

  const globalBounds = useMemo(
    () => computeGlobalHourBounds(chartDataByDay),
    [chartDataByDay]
  )

  const trimmedByDay = useMemo(() => {
    const out: Record<string, HourlyPoint[]> = {}
    for (const dayName of WEEKDAY_ORDER) {
      out[dayName] = sliceByGlobalBounds(chartDataByDay[dayName], globalBounds)
    }
    return out
  }, [chartDataByDay, globalBounds])

  const domain = useMemo(
    () => computeDomain(Object.values(trimmedByDay)),
    [trimmedByDay]
  )
  const range: [number, number] = [16, 225]

  return (
    <div style={ { width: '100%' } }>
      { WEEKDAY_ORDER.map((dayName) => {
        const data = trimmedByDay[dayName]
        return (
          <ResponsiveContainer key={ dayName } width="100%" height={ 60 }>
            <ScatterChart
              margin={ {
                top: 10,
                right: 0,
                bottom: 0,
                left: 0,
              } }
            >
              <XAxis
                type="category"
                dataKey="hour"
                interval={ 0 }
                tick={ { fontSize: 10 } }
                tickLine={ { transform: 'translate(0, -6)' } }
              />
              <YAxis
                type="number"
                dataKey="index"
                height={ 10 }
                width={ 80 }
                tick={ false }
                tickLine={ false }
                axisLine={ false }
                label={ { value: dayName, position: 'insideRight' } }
              />
              <ZAxis type="number" dataKey="value" domain={ domain } range={ range }/>
              <Tooltip
                cursor={ { strokeDasharray: '3 3' } }
                wrapperStyle={ { zIndex: 100 } }
                content={ makeTooltip(dayName) }
              />
              <Scatter data={ data } fill={ theme.colors?.primary as '#fff' }/>
            </ScatterChart>
          </ResponsiveContainer>
        )
      }) }
    </div>
  )
}
