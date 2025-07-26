import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { Button, Heading, Paragraph, Spinner } from 'theme-ui'
import { useTimeout } from 'usehooks-ts'

import { WelcomeStepProps } from './types'

export function FinalStepPage ({ goToNextStep }: WelcomeStepProps) {
  const { t } = useTranslation('pages')

  useTimeout(() => goToNextStep(), 4000)

  return (
    <>
      <Heading as="h1">{ t('welcome.final.title') }</Heading>
      <Paragraph>{ t('welcome.final.description') }</Paragraph>
      <Spinner/>
      <Button onClick={ goToNextStep }>{ t('welcome.final.cta') }</Button>
    </>
  )
}
