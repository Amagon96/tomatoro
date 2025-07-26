import type { User } from '@supabase/supabase-js'
import type { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { Paragraph } from 'theme-ui'

import { DashboardPage } from '~/components/templates/dashboard-page'
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

  return {
    props: {
      user: data.user,
    },
  }
}

export default function DashboardProfilePage ({ user }: { user: User }) {
  const { t } = useTranslation('dashboard')

  return (
    <DashboardPage subtitle={ t('profile.title') }>
      <Paragraph sx={ { height: 300 } }>Work in progress...</Paragraph>
    </DashboardPage>
  )
}
