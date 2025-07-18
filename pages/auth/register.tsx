import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import { usePostHog } from 'posthog-js/react'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Button, Card, Flex, Heading, Input, Paragraph } from 'theme-ui'

import { BackCta } from '~/components/atoms/back-cta'
import { Page } from '~/components/templates/page'
import { createClient } from '~/utils/supabase/component'

type Inputs = {
  email: string
  password: string
  verify: string
}

export default function RegisterPage () {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useTranslation('auth')
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
    watch,
  } = useForm<Inputs>()

  async function signUp ({ email, password }: Inputs) {
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      console.error(error)
    }

    router.push('/')
  }

  return isUserActivityEnabled && (
    <Page subtitle={ t('register.title') } noHeader noFooter>
      <Box sx={ { maxWidth: 400, mx: 'auto', px: 3, py: 4 } }>
        <Card>
          <Heading as="h1" sx={ { pb: 3 } }>{ t('register.title') }</Heading>

          <Flex sx={ { gap: 3, flexShrink: 0, flexDirection: 'column' } } as="form" onSubmit={ handleSubmit(signUp) }>
            <Flex sx={ { flexDirection: 'column', gap: 2, width: '100%' } }>
              <Input
                placeholder={ t('register.email') }
                {
                  ...register('email', {
                    required: true,
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  })
                }
              />
              { errors.email && <Paragraph variant="small">{ t('register.error.email') }</Paragraph> }
            </Flex>

            <Flex sx={ { flexDirection: 'column', gap: 2, width: '100%' } }>
              <Input
                placeholder={ t('register.password') }
                type="password"
                {
                  ...register('password', {
                    required: true,
                    minLength: 8,
                  })
                }
              />
              { errors.password && <Paragraph variant="small">{ t('register.error.password') }</Paragraph> }
            </Flex>

            <Flex sx={ { flexDirection: 'column', gap: 2, width: '100%' } }>
              <Input
                placeholder={ t('register.verify') }
                type="verify"
                {
                  ...register('verify', {
                    required: true,
                    validate: (value) => value === watch('password'),
                  })
                }
              />
              { errors.verify && <Paragraph variant="small">{ t('register.error.verify') }</Paragraph> }
            </Flex>

            <Button type="submit">{ t('register.cta') }</Button>

            <div>
              <BackCta/>
            </div>
          </Flex>
        </Card>
      </Box>
    </Page>
  )
}
