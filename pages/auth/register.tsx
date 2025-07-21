import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Button, Card, Flex, Heading, Input, Link as TuiLink, Message, Paragraph } from 'theme-ui'
import { useBoolean } from 'usehooks-ts'

import { BackCta } from '~/components/atoms/back-cta'
import { Page } from '~/components/templates/page'
import { LINKS } from '~/utils/config'
import { createClient } from '~/utils/supabase/component'

type Inputs = {
  email: string
  password: string
  verify: string
}

export default function RegisterPage () {
  const supabase = createClient()
  const { t } = useTranslation('auth')
  const [serverError, setServerError] = useState<string | null>(null)
  const { setTrue, value: isSuccess } = useBoolean()

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<Inputs>({
    mode: 'onBlur',
  })

  async function signUp ({ email, password }: Inputs) {
    const { error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setServerError(signUpError.code!)
      return
    }

    setTrue()
    reset()
  }

  return (
    <Page subtitle={ t('register.title') } noHeader noFooter>
      <Box sx={ { maxWidth: 400, mx: 'auto', px: 3, py: 4 } }>
        <Card>
          <Heading as="h1" sx={ { pb: 3 } }>{ t('register.title') }</Heading>

          <Flex sx={ { gap: 3, flexShrink: 0, flexDirection: 'column' } } as="form" onSubmit={ handleSubmit(signUp) }>
            { serverError && <Message>{ t(`register.error.${ serverError }`) }</Message> }

            { isSuccess && <Message>{ t('register.success') }</Message> }

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
                type="password"
                {
                  ...register('verify', {
                    required: true,
                    validate: (value) => value === watch('password'),
                  })
                }
              />
              { errors.verify && <Paragraph variant="small">{ t('register.error.verify') }</Paragraph> }
            </Flex>

            <Button type="submit" disabled={ isSubmitting }>{ t('register.cta') }</Button>

            <div>
              <TuiLink as={ Link } href={ LINKS.LOGIN }>{ t('register.login') }</TuiLink>
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
