import { User } from '@supabase/supabase-js'
import { GetServerSideProps, type GetServerSidePropsContext } from 'next'
import { router } from 'next/client'
import useTranslation from 'next-translate/useTranslation'
import React, { useCallback } from 'react'
import DatePicker from 'react-datepicker'

import { DashboardPage } from '~/components/templates/dashboard-page'
import { WeeklyActivityReport } from '~/components/templates/weekly-activity-report'
import { retrieveUser } from '~/utils/supabase/queries/profile.query'
import { retrieveWeeklyReport, SegmentReportBasedOnDays } from '~/utils/supabase/queries/segments.query'
import { createClient } from '~/utils/supabase/server-props'

import 'react-datepicker/dist/react-datepicker.css'

interface Props {
  date: string,
  user: User,
  weeklyReport: SegmentReportBasedOnDays
}

export const getServerSideProps: GetServerSideProps<
  { user: User; weeklyReport: { day: string; segments: any[] }[] },
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

  const weeklyReport = await retrieveWeeklyReport(
    supabase,
    parsed,
  )

  return {
    props: { date, user, weeklyReport },
  }
}

export default function DashboardActivityPage ({ date, weeklyReport }: Props) {
  const { t } = useTranslation('dashboard')

  const updateDate = useCallback(async (date: Date | null) => {
    const [nextDate] = (date || new Date()).toISOString().split('T')
    await router.push(`/dashboard/activity/weekly/${ nextDate }`)
  }, [])

  return (
    <DashboardPage subtitle={ t('activity.title') }>
      <WeeklyActivityReport report={ weeklyReport }>
        <DatePicker
          selected={ new Date(date) }
          todayButton="Today"
          onChange={ updateDate }
          dateFormat="MM/yyyy"
          showWeekPicker
        />
      </WeeklyActivityReport>
    </DashboardPage>
  )
}
