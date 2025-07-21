import type { User } from '@supabase/supabase-js'
import type { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { Grid, Heading } from 'theme-ui'

import { BackCta } from '~/components/atoms/back-cta'
import { ActivityPage } from '~/components/organisms/activity'
import { Page } from '~/components/templates/page'
import { retrieveMonthlyReport, WeeklyReport } from '~/utils/supabase/queries/segments.query'
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

  const monthlyReport = await retrieveMonthlyReport({ supabase, user: data.user })

  return {
    props: {
      user: data.user,
      monthlyReport,
    },
  }
}

export default function DashboardPage ({ monthlyReport, user }: {
  user: User,
  monthlyReport: WeeklyReport
}) {
  const { t } = useTranslation('pages')
  const name = user.user_metadata.displayName || user.email

  return (
    <Page subtitle={ t('dashboard.title') } isWrapped>
      <Grid variant="contained" sx={ { justifyItems: 'start' } }>
        <Heading as="h1">{ t('dashboard.greeting', { name }) }</Heading>

        <ActivityPage report={ monthlyReport }/>

        <BackCta/>
      </Grid>
    </Page>
  )
}
