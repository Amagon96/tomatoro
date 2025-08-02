import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Avatar, Button, Flex, Heading, Input, Label, Paragraph } from 'theme-ui'

import { useUserContext } from '~/contexts/user'
import { PROFILE_THUMBNAILS } from '~/utils/config'
import { createClient } from '~/utils/supabase/component'

import { WelcomeStepProps } from './types'

type ProfileInputs = {
  displayName: string
  thumbnail: number
}

export function ProfileStepPage ({ goToNextStep }: WelcomeStepProps) {
  const { t } = useTranslation('pages')
  const supabase = createClient()
  const { profile, refreshProfile, user } = useUserContext()
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
  } = useForm<ProfileInputs>({
    mode: 'onBlur',
    defaultValues: {
      displayName: '',
      thumbnail: PROFILE_THUMBNAILS[0].id,
    },
  })

  async function updateProfile ({ displayName, thumbnail }: ProfileInputs) {
    let error

    if (profile) {
      const response = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          thumbnail,
        })
        .eq('user_id', user!.id) // TODO fix this !
        .select()

      error = response.error
    } else {
      const response = await supabase
        .from('profiles')
        .insert({
          user_id: user!.id,
          display_name: displayName,
          thumbnail,
        })
        .select()

      error = response.error
    }

    if (error) {
      console.error('Error updating profile:', error)
      return
    }

    await refreshProfile(user!.id) // TODO fix this !
    goToNextStep()
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
            borderColor: 'black',
          },
        } }>
          <Label>{ t('welcome.profile.thumbnailLabel') }</Label>
          {
            PROFILE_THUMBNAILS.map(({ id, src }) => (
              <label key={ id }>
                <input type="radio" value={ id } { ...register('thumbnail') } />
                <Avatar src={ src }/>
              </label>
            ))
          }
        </Flex>
        <Button type='submit' disabled={ isSubmitting }>{ t('welcome.profile.cta') }</Button>
      </Flex>
    </>
  )
}
