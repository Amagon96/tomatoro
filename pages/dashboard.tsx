import type { User } from '@supabase/supabase-js'
import type { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { Grid, Heading } from 'theme-ui'

import { BackCta } from '~/components/atoms/back-cta'
import { Page } from '~/components/templates/page'
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

export default function DashboardPage ({ user }: { user: User }) {
  const { t } = useTranslation('pages')

  return (
    <Page subtitle={ t('login.title') } isWrapped>
      <Grid variant="contained" sx={ { justifyItems: 'start' } }>
        <Heading as="h1">{ t('dashboard.title', { name: user.email }) }</Heading>

        <BackCta/>
      </Grid>
    </Page>
  )
}
