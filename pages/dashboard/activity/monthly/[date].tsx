import { User } from '@supabase/supabase-js'
import { GetServerSideProps, type GetServerSidePropsContext } from 'next'
import { router } from 'next/client'
import useTranslation from 'next-translate/useTranslation'
import React, { useCallback } from 'react'
import DatePicker from 'react-datepicker'

import { DashboardPage } from '~/components/templates/dashboard-page'
import { WeeklyActivityReport } from '~/components/templates/weekly-activity-report'
import { retrieveUser } from '~/utils/supabase/queries/profile.query'
import {
  retrieveMonthlyReport,
  retrieveWeeklyReport,
  SegmentReportBasedOnDays,
} from '~/utils/supabase/queries/segments.query'
import { createClient } from '~/utils/supabase/server-props'

import 'react-datepicker/dist/react-datepicker.css'

interface Props {
  date: string,
  user: User,
  monthlyReport: SegmentReportBasedOnDays
}

export const getServerSideProps: GetServerSideProps<
  { user: User; monthlyReport: { day: string; segments: any[] }[] },
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

  const monthlyReport = await retrieveMonthlyReport(
    supabase,
    parsed.getFullYear(),
    parsed.getMonth(),
  )

  return {
    props: { date, user, monthlyReport },
  }
}

export default function DashboardActivityPage ({ date, monthlyReport }: Props) {
  const { t } = useTranslation('dashboard')

  const updateDate = useCallback(async (date: Date | null) => {
    const [nextDate] = (date || new Date()).toISOString().split('T')
    await router.push(`/dashboard/activity/monthly/${ nextDate }`)
  }, [])

  return (
    <DashboardPage subtitle={ t('activity.title') }>
      <DatePicker
        selected={ new Date(date) }
        todayButton="Today"
        onChange={ updateDate }
        dateFormat="MM/yyyy"
        showWeekPicker
      />
    </DashboardPage>
  )
}
