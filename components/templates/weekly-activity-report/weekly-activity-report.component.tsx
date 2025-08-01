import { ReactNode } from 'react'
import { Flex } from 'theme-ui'

import { Segment } from '~/@types/types.db'
import { ActivityStreakChart } from '~/components/organisms/charts/activity-streak-chart.component'
import { BubbleChart } from '~/components/organisms/charts/bubble-chart.component'
import { PomodoroFunnelChart } from '~/components/organisms/charts/pomodoro-funnel-chart.component'
import { StackedAreaChart } from '~/components/organisms/charts/stacked-area-chart.component'

interface Props {
  children: ReactNode,
  report: Array<{
    day: string,
    segments: Array<Segment>
  }>
}

export const WeeklyActivityReport = ({ children, report }: Props) => {
  return (
    <>
      <Flex sx={ { justifyContent: 'space-between', alignItems: 'center' } }>
        <h1>Weekly activity report</h1>
        { children }
      </Flex>

      <BubbleChart weeklyReport={ report }/>

      <StackedAreaChart report={ report }/>

      <ActivityStreakChart report={ report }/>

      <PomodoroFunnelChart report={ report }/>
    </>
  )
}
