import type { User } from '@supabase/supabase-js'
import type { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { Card, Flex, Heading, Paragraph } from 'theme-ui'

import { DashboardPage } from '~/components/templates/dashboard-page'
import { SettingsForm } from '~/components/templates/settings-form'
import { PasswordUpdateForm, ProfileForm } from '~/pages/dashboard/profile'
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

export default function DashboardSettingsPage ({ user }: { user: User }) {
  const { t } = useTranslation('dashboard')

  return (
    <DashboardPage subtitle={ t('settings.title') }>
      <Flex
        sx={ {
          flexDirection: 'row',
          gap: 3,
        } }
      >
        <Card sx={ { width: '50%' } }>
          <Heading as="h3" sx={ { pb: 3 } }>Your profile</Heading>
          <SettingsForm/>
        </Card>
      </Flex>
    </DashboardPage>
  )
}
