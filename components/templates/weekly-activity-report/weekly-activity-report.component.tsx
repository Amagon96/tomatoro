import React, { ReactNode } from 'react'
import { Card, Flex, Heading, Paragraph, Text } from 'theme-ui'

import { Segment } from '~/@types/types.db'
import { ActivityStreakChart } from '~/components/organisms/charts/activity-streak-chart.component'
import { BubbleChart } from '~/components/organisms/charts/bubble-chart.component'
import { GapHistogramChart } from '~/components/organisms/charts/gap-histogram-chart.component'
import { PercentStackedAreaChart } from '~/components/organisms/charts/percentage-stacked-area-chart.component'
import { PomodoroFunnelChart } from '~/components/organisms/charts/pomodoro-funnel-chart.component'
import { ProductiveHoursChart } from '~/components/organisms/charts/productive-hours-chart.component'
import { SegmentTypePieChart } from '~/components/organisms/charts/segment-type-pie-chart.component'
import { StackedAreaChart } from '~/components/organisms/charts/stacked-area-chart.component'
import { summarizeFocusMetrics } from '~/utils/summarize-focus-metrics'

interface Props {
  children: ReactNode,
  report: Array<{
    day: string,
    segments: Array<Segment>
  }>
}

export const WeeklyActivityReport = ({ children, report }: Props) => {
  const summarizedFocusMetrics = summarizeFocusMetrics(report)

  return (
    <>
      <Flex sx={ { justifyContent: 'space-between', alignItems: 'center' } }>
        <h1>Weekly activity report</h1>
        { children }
      </Flex>

      <Card>
        <Heading as="h3" sx={ { pb: 3 } }>Hourly activity by week day</Heading>
        <BubbleChart weeklyReport={ report }/>
      </Card>

      <Flex sx={ { gap: 3 } }>
        <Card sx={ { width: `${ 100 / 3 }%`, px: 3 } }>
          <Heading as="h3">Focus streak</Heading>
          <Text variant="invertedDisplay">
            { summarizedFocusMetrics.focusStreak }
          </Text>
          <Text>
            days
          </Text>
          <Paragraph>
            You&apos;ve consistently completed focus sessions for { summarizedFocusMetrics.focusStreak } days
          </Paragraph>
        </Card>

        <Card sx={ { width: `${ 100 / 3 }%`, px: 3 } }>
          <Heading as="h3">Focus level</Heading>
          <Text variant="invertedDisplay">
            { Math.round(summarizedFocusMetrics.focusLevel * 100) }
          </Text>
          <Text>
            %
          </Text>
          <Paragraph>
            Proportion of focus segments over total segments
          </Paragraph>
        </Card>

        <Card sx={ { width: `${ 100 / 3 }%`, px: 3 } }>
          <Heading as="h3">Recovery time</Heading>
          <Text variant="invertedDisplay">
            { Math.round(summarizedFocusMetrics.recoveryTime / 60) }
          </Text>
          <Text>
            minutes
          </Text>
          <Paragraph>
            Average break duration between consecutive focus segments
          </Paragraph>
        </Card>
      </Flex>

      <Flex sx={ { gap: 3 } }>
        <Card sx={ { width: '100%', px: 3 } }>
          <Heading as="h3" sx={ { pb: 3 } }>Total events by week day</Heading>
          <StackedAreaChart report={ report }/>
        </Card>
      </Flex>

      <Flex sx={ { gap: 3 } }>
        <Card sx={ { width: '60%', px: 3 } }>
          <Heading as="h3" sx={ { pb: 3 } }>Percentage by type</Heading>
          <PercentStackedAreaChart report={ report }/>
        </Card>

        <Card sx={ { width: '40%', px: 3 } }>
          <Heading as="h3" sx={ { pb: 3 } }>Global breakdown</Heading>
          <SegmentTypePieChart report={ report }/>
        </Card>
      </Flex>

      <Flex sx={ { gap: 3 } }>
        <Card sx={ { width: '50%', px: 3 } }>
          <Heading as="h3" sx={ { pb: 3 } }>Weekly streak</Heading>
          <ActivityStreakChart report={ report }/>
        </Card>

        <Card sx={ { width: '50%', px: 3 } }>
          <Heading as="h3" sx={ { pb: 3 } }>Funnel chart</Heading>
          <PomodoroFunnelChart report={ report }/>
        </Card>
      </Flex>

      <Flex sx={ { gap: 3 } }>
        <Card sx={ { width: '50%', px: 3 } }>
          <Heading as="h3" sx={ { pb: 3 } }>Most productive hours</Heading>
          <ProductiveHoursChart report={ report }/>
        </Card>

        <Card sx={ { width: '50%', px: 3 } }>
          <Heading as="h3" sx={ { pb: 3 } }>Gap analysis</Heading>
          <GapHistogramChart report={ report }/>
        </Card>
      </Flex>
    </>
  )
}
