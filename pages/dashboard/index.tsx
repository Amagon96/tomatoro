import type { User } from '@supabase/supabase-js'
import type { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'

import { BackCta } from '~/components/atoms/back-cta'
import { ActivityPage } from '~/components/organisms/activity'
import { DashboardPage } from '~/components/templates/dashboard-page'
import { retrieveMonthlyReport, SegmentReportBasedOnDays } from '~/utils/supabase/queries/segments.query'
import { createClient } from '~/utils/supabase/server-props'

export async function getServerSideProps (context: GetServerSidePropsContext) {
  const supabase = createClient(context)

  const { data, error } = await supabase.auth.getUser()

  if (error || !data) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const monthlyReport = await retrieveMonthlyReport(supabase)

  return {
    props: {
      user: data.user,
      monthlyReport,
    },
  }
}

export default function DashboardIndexPage ({ monthlyReport, user }: {
  user: User,
  monthlyReport: SegmentReportBasedOnDays
}) {
  const { t } = useTranslation('pages')

  return (
    <DashboardPage subtitle={ t('dashboard.title') }>
      <ActivityPage report={ monthlyReport }/>

      <BackCta/>
    </DashboardPage>
  )
}
