import { User } from '@supabase/supabase-js'
import { GetServerSideProps, type GetServerSidePropsContext } from 'next'
import { router } from 'next/client'
import useTranslation from 'next-translate/useTranslation'
import React, { useCallback } from 'react'
import DatePicker from 'react-datepicker'

import { ActivityReport } from '~/components/templates/activity-report'
import { DashboardPage } from '~/components/templates/dashboard-page'
import { retrieveUser } from '~/utils/supabase/queries/profile.query'
import { retrieveMonthlyReport, WeeklyReport } from '~/utils/supabase/queries/segments.query'
import { createClient } from '~/utils/supabase/server-props'

import 'react-datepicker/dist/react-datepicker.css'

interface Props {
  date: string,
  user: User,
  monthlyReport: WeeklyReport
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

  // 5. Fetch the report
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
    await router.push(`/dashboard/activity/${ nextDate }`)
  }, [])

  return (
    <DashboardPage subtitle={ t('activity.title') }>
      <DatePicker
        selected={ new Date(date) }
        todayButton="Today"
        onChange={ updateDate }
        dateFormat="MM/yyyy"
        showMonthYearPicker
      />

      <ActivityReport report={ monthlyReport }/>
    </DashboardPage>
  )
}
