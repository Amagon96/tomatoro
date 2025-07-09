import * as Sentry from '@sentry/nextjs'
import useTranslation from 'next-translate/useTranslation'
import React, { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Card, Flex, Heading, Input, Paragraph } from 'theme-ui'
import { useLocalStorage } from 'usehooks-ts'

import { postSubscription } from '~/utils/cms.api'

type Inputs = {
  email: string
}

export const SubscribeWidget: FC = () => {
  const { t } = useTranslation('subscribe')
  const [isEmailSubscribed, setIsEmailSubscribed] = useLocalStorage('email-subscribed', false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const isSubscriptionDisabled = Boolean(isEmailSubscribed || isSubscribing)
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<Inputs>()

  async function handleSubscribeSubmit (data: Inputs) {
    try {
      setIsSubscribing(true)
      await postSubscription({ email: data.email })
      setIsSubscribing(false)
      setIsEmailSubscribed(true)
    } catch (e) {
      Sentry.captureException(e)
      setIsSubscribing(false)
    }
  }

  return (
    <Card variant="widget" sx={ { display: 'flex', flexDirection: 'column', gap: 3 } }>
      <Heading as="h2" m={ 0 }>{ t('title') }</Heading>
      <Paragraph>{ t('content') }</Paragraph>
      { isSubscriptionDisabled ? (
        <Flex sx={ { gap: 3, flexShrink: 0 } } as="form" onSubmit={ handleSubmit(handleSubscribeSubmit) }>
          <Input value={ t('thanks') } disabled/>
        </Flex>
      ) : (
        <Flex sx={ { gap: 3, flexShrink: 0 } } as="form" onSubmit={ handleSubmit(handleSubscribeSubmit) }>
          <Flex sx={ { flexDirection: 'column', gap: 2, width: '100%' } }>
            <Input placeholder={ t('placeholder') } { ...register('email', { required: true }) } />
            { errors.email && <Paragraph variant="small">{ t('error') }</Paragraph> }
          </Flex>
          <Button type="submit">{ t('cta') }</Button>
        </Flex>
      ) }
      <Paragraph variant="small">{ t('caption') }</Paragraph>
    </Card>
  )
}
