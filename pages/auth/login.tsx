import Link from 'next/link'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Box, Button, Card, Flex, Heading, Input, Link as TuiLink, Message, Paragraph } from 'theme-ui'

import { BackCta } from '~/components/atoms/back-cta'
import { Page } from '~/components/templates/page'
import { LINKS } from '~/utils/config'
import { createClient } from '~/utils/supabase/component'

type Inputs = {
  email: string
  password: string
}

export default function LoginPage () {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useTranslation('auth')
  const [serverError, setServerError] = React.useState<string | null>(null)

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<Inputs>({
    mode: 'onBlur',
  })

  async function logIn ({ email, password }: Inputs) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (!error) {
      await router.push('/dashboard')
      return
    }

    setServerError(error.code!)
  }

  return (
    <Page subtitle={ t('login.title') } noHeader noFooter>
      <Box sx={ { maxWidth: 400, mx: 'auto', px: 3, py: 4 } }>
        <Card>
          <Heading as="h1" sx={ { pb: 3 } }>{ t('login.title') }</Heading>

          <Flex sx={ { gap: 3, flexShrink: 0, flexDirection: 'column' } } as="form" onSubmit={ handleSubmit(logIn) }>
            { serverError && <Message>{ t(`login.error.${ serverError }`) }</Message> }

            <Flex sx={ { flexDirection: 'column', gap: 2, width: '100%' } }>
              <Input
                placeholder={ t('login.email') }
                {
                  ...register('email', {
                    required: true,
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  })
                }
              />
              { errors.email && <Paragraph variant="small">{ t('login.error.email') }</Paragraph> }
            </Flex>

            <Flex sx={ { flexDirection: 'column', gap: 2, width: '100%' } }>
              <Input
                placeholder={ t('login.password') }
                type="password"
                { ...register('password', { required: true }) }
              />
              { errors.password && <Paragraph variant="small">{ t('login.error.password') }</Paragraph> }
            </Flex>

            <Button type="submit" disabled={ isSubmitting }>{ t('login.cta') }</Button>

            <div>
              <TuiLink as={ Link } href={ LINKS.REGISTER }>{ t('login.signUp') }</TuiLink>
            </div>

            <div>
              <BackCta/>
            </div>
          </Flex>
        </Card>
      </Box>
    </Page>
  )
}
