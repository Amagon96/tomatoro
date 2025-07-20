import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Card, Flex, Heading, Paragraph, Button, Progress, Input, Label, Spinner } from 'theme-ui'
import { useTimeout } from 'usehooks-ts'

import { LanguageSelector } from '~/components/molecules/language-selector'
import { Page } from '~/components/templates/page'
import { LINKS } from '~/utils/config'
import { createClient } from '~/utils/supabase/component'

const STEPS = [
  LanguageStep,
  ProfileStep,
  FinalStep,
]

export default function CallbackPage () {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useTranslation('pages')
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const CurrentStep = useMemo(() => STEPS[currentStepIndex], [currentStepIndex])

  async function goToNextStep () {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      await router.push(LINKS.HOME)
    }
  }

  useEffect(() => {
    async function checkUser () {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        await router.push(LINKS.LOGIN)
      }
    }

    checkUser().then()
  })

  return (
    <Page subtitle={ t('welcome.title') } noHeader noFooter>
      <Box sx={ { maxWidth: 400, mx: 'auto', px: 3, py: 4 } }>
        <Progress max={ STEPS.length } value={ currentStepIndex + 1 } sx={ { mb: 4 } }/>
        <Card>
          <Flex sx={ { flexDirection: 'column', gap: 3 } }>
            <CurrentStep goToNextStep={ goToNextStep }/>
          </Flex>
        </Card>
      </Box>
    </Page>
  )
}

interface WelcomeStepProps {
  goToNextStep: () => void
}

function LanguageStep ({ goToNextStep }: WelcomeStepProps) {
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

type ProfileInputs = {
  displayName: string
  thumbnail: string
}

const THUMBNAILS = [
  { id: '1', src: 'https://placehold.co/40' },
  { id: '2', src: 'https://placehold.co/40' },
  { id: '3', src: 'https://placehold.co/40' },
  { id: '4', src: 'https://placehold.co/40' },
]

function ProfileStep ({ goToNextStep }: WelcomeStepProps) {
  const { t } = useTranslation('pages')
  const supabase = createClient()
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
  } = useForm<ProfileInputs>({
    mode: 'onBlur',
    defaultValues: {
      displayName: '',
      thumbnail: THUMBNAILS[0].id,
    },
  })

  async function updateProfile ({ displayName, thumbnail }: ProfileInputs) {
    await supabase.auth.updateUser({
      data: {
        displayName,
        thumbnail,
      },
    }).then(({ error }) => {
      if (error) {
        console.error('Error updating profile:', error)
        return
      }
      goToNextStep()
    })
  }

  return (
    <>
      <Heading as="h1">{ t('welcome.profile.title') }</Heading>
      <Paragraph>{ t('welcome.profile.description') }</Paragraph>
      <Flex
        as="form"
        onSubmit={ handleSubmit(updateProfile) }
        sx={ {
          gap: 3,
          flexShrink: 0,
          flexDirection: 'column',
          width: '100%',
          maxWidth: 400,
        } }
      >
        <Flex sx={ { flexDirection: 'column', gap: 2, width: '100%' } }>
          <Label>{ t('welcome.profile.displayNameLabel') }</Label>
          <Input
            placeholder={ t('welcome.profile.displayNamePlaceholder') }
            { ...register('displayName') }
          />
        </Flex>
        <Flex sx={ {
          gap: 2,
          flexWrap: 'wrap',
          '& input': {
            display: 'none',
          },
          '& img': {
            border: '3px solid',
            borderColor: 'transparent',
          },
          '& input:checked ~ img': {
            borderColor: 'primary',
          },
        } }>
          <Label>{ t('welcome.profile.thumbnailLabel') }</Label>
          {
            THUMBNAILS.map(({ id, src }) => (
              <label key={ id }>
                <input type="radio" value={ id } { ...register('thumbnail') }/>
                <img src={ src } alt={ `Avatar number ${ id }` }/>
              </label>
            ))
          }
        </Flex>
        <Button type='submit' disabled={ isSubmitting }>{ t('welcome.profile.cta') }</Button>
      </Flex>
    </>
  )
}

function FinalStep ({ goToNextStep }: WelcomeStepProps) {
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
