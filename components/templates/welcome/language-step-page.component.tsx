import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { Button, Heading, Paragraph } from 'theme-ui'

import { LanguageSelector } from '~/components/molecules/language-selector'

import { WelcomeStepProps } from './types'

export function LanguageStepPage ({ goToNextStep }: WelcomeStepProps) {
  const { t } = useTranslation('pages')

  return (
    <>
      <Heading as="h1">{ t('welcome.language.title') }</Heading>
      <Paragraph>{ t('welcome.language.description') }</Paragraph>
      <LanguageSelector/>
      <Button onClick={ goToNextStep }>{ t('welcome.language.cta') }</Button>
    </>
  )
}
