import { User } from '@supabase/supabase-js'
import { GetServerSideProps, type GetServerSidePropsContext } from 'next'
import { router } from 'next/client'
import useTranslation from 'next-translate/useTranslation'
import React, { useCallback } from 'react'
import DatePicker from 'react-datepicker'
import { Card, Flex, Heading } from 'theme-ui'

import { FocusStreakChart } from '~/components/organisms/charts/monthly/focus-streak-chart.component'
import { DashboardPage } from '~/components/templates/dashboard-page'
import { retrieveUser } from '~/utils/supabase/queries/profile.query'
import {
  retrieveMonthlyReport,
  SegmentReportBasedOnDays,
} from '~/utils/supabase/queries/segments.query'
import { createClient } from '~/utils/supabase/server-props'

import 'react-datepicker/dist/react-datepicker.css'

interface Props {
  date: string,
  user: User,
  report: SegmentReportBasedOnDays
}

export const getServerSideProps: GetServerSideProps<
  { user: User; report: { day: string; segments: any[] }[] },
  { date: string }
> = async (context: GetServerSidePropsContext<{ date: string }>) => {
  const supabase = createClient(context)
  const user = await retrieveUser(supabase)

  if (!user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const date = context.params?.date || new Date().toISOString()
  const parsed = new Date(date)

  const report = await retrieveMonthlyReport(
    supabase,
    parsed.getFullYear(),
    parsed.getMonth(),
  )

  return {
    props: { date, user, report },
  }
}

export default function DashboardActivityPage ({ date, report }: Props) {
  const { t } = useTranslation('dashboard')

  const updateDate = useCallback(async (date: Date | null) => {
    const [nextDate] = (date || new Date()).toISOString().split('T')
    await router.push(`/dashboard/activity/monthly/${ nextDate }`)
  }, [])

  return (
    <DashboardPage subtitle={ t('activity.title') }>
      <Flex sx={ { justifyContent: 'space-between', alignItems: 'center' } }>
        <h1>Monthly activity report</h1>

        <DatePicker
          selected={ new Date(date) }
          todayButton="Today"
          onChange={ updateDate }
          dateFormat="MM/yyyy"
        />
      </Flex>

      <Card>
        <Heading as="h3" sx={ { pb: 3 } }>Hourly activity by week day</Heading>
        <FocusStreakChart report={ report }/>
      </Card>
    </DashboardPage>
  )
}
