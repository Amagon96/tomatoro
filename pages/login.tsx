import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import { usePostHog } from 'posthog-js/react'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Flex, Grid, Heading, Input, Paragraph } from 'theme-ui'

import { BackCta } from '~/components/atoms/back-cta'
import { Page } from '~/components/templates/page'
import { createClient } from '~/utils/supabase/component'

type Inputs = {
  email: string
  password: string
}

export default function LoginPage () {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useTranslation('pages')
  const posthog = usePostHog()
  const isUserActivityEnabled = posthog.isFeatureEnabled('user-activity')

  useEffect(() => {
    if (!isUserActivityEnabled) {
      router.push('/')
    }
  })

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<Inputs>()

  async function logIn ({ email, password }: Inputs) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.error(error)
    }

    router.push('/dashboard')
  }

  async function signUp ({ email, password }: Inputs) {
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      console.error(error)
    }

    router.push('/')
  }

  return isUserActivityEnabled && (
    <Page subtitle={ t('login.title') } isWrapped>
      <Grid variant="contained" sx={ { justifyItems: 'start' } }>
        <Heading as="h1">{ t('login.title') }</Heading>

        <Flex sx={ { gap: 3, flexShrink: 0, flexDirection: 'column' } } as="form" onSubmit={ handleSubmit(logIn) }>
          <Flex sx={ { flexDirection: 'column', gap: 2, width: '100%' } }>
            <Input
              placeholder={ t('login.email') }
              { ...register('email', { required: true }) }
            />
            { errors.email && <Paragraph variant="small">{ t('error') }</Paragraph> }
          </Flex>
          <Flex sx={ { flexDirection: 'column', gap: 2, width: '100%' } }>
            <Input
              placeholder={ t('login.password') }
              type="password"
              { ...register('password', { required: true }) }
            />
            { errors.email && <Paragraph variant="small">{ t('error') }</Paragraph> }
          </Flex>
          <Button type="submit">{ t('login.cta') }</Button>
        </Flex>

        <BackCta/>
      </Grid>
    </Page>
  )
}
