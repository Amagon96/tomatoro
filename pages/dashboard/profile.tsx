import type { User } from '@supabase/supabase-js'
import type { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Box, Label, Input, Select, Button, Text, Card, Flex, Heading, Avatar } from 'theme-ui'

import { DashboardPage } from '~/components/templates/dashboard-page'
import { PROFILE_THUMBNAILS } from '~/utils/config'
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

type ProfileFormValues = {
  name: string
  thumbnail: number
  preferredTimezone: string
  firstDayOfWeek: string
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export default function DashboardProfilePage ({ user }: { user: User }) {
  const { t } = useTranslation('dashboard')

  return (
    <DashboardPage subtitle={ t('profile.title') }>
      <Flex
        sx={ {
          flexDirection: 'row',
          gap: 3,
        } }
      >
        <Card sx={ { width: '50%' } }>
          <Heading as="h3" sx={ { pb: 3 } }>Your profile</Heading>
          <ProfileForm/>
        </Card>
        <Card sx={ { width: '50%' } }>
          <Heading as="h3" sx={ { pb: 3 } }>Update password</Heading>
          <PasswordUpdateForm/>
        </Card>
      </Flex>
    </DashboardPage>
  )
}

// Try to get all IANA time zones; fallback to a minimal list if not available.
const getTimezoneOptions = (): string[] => {
  if (typeof Intl !== 'undefined' && typeof (Intl as any).supportedValuesOf === 'function') {
    try {
      return (Intl as any).supportedValuesOf('timeZone') as string[]
    } catch {
      // ignore and fallback
    }
  }
  return ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'America/Los_Angeles']
}

export function ProfileForm (): JSX.Element {
  const timezoneOptions = React.useMemo(() => getTimezoneOptions(), [])

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ProfileFormValues>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      thumbnail: PROFILE_THUMBNAILS[0].id,
      preferredTimezone: 'auto',
      firstDayOfWeek: 'Monday',
    },
  })

  const onSubmit = (values: ProfileFormValues) => {
    console.log('profile form submitted', values)
  }

  return (
    <Box as="form" onSubmit={ handleSubmit(onSubmit) } aria-label="Profile update form">
      {/* Name field */ }
      <Box mb={ 3 }>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          { ...register('name', {
            required: 'Name is required',
            minLength: {
              value: 4,
              message: 'Name must be at least 4 characters',
            },
          }) }
          aria-invalid={ errors.name ? 'true' : 'false' }
          placeholder="Your name"
        />
        { errors.name && (
          <Text as="div" sx={ { color: 'red', fontSize: 1, mt: 1 } }>
            { errors.name.message }
          </Text>
        ) }
      </Box>

      {/*Thumbnail*/ }
      <Box mb={ 3 }>
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
          <Label>Thumbnail</Label>
          {
            PROFILE_THUMBNAILS.map(({ id, src }) => (
              <label key={ id }>
                <input type="radio" value={ id } { ...register('thumbnail') } />
                <Avatar src={ src }/>
              </label>
            ))
          }
        </Flex>
      </Box>

      {/* Preferred timezone */ }
      <Box mb={ 3 }>
        <Label htmlFor="preferredTimezone">Preferred Timezone</Label>
        <Select
          id="preferredTimezone"
          { ...register('preferredTimezone', {
            required: true,
          }) }
          aria-invalid={ errors.preferredTimezone ? 'true' : 'false' }
        >
          <option value="auto">Auto</option>
          { timezoneOptions.map((tz) => (
            <option key={ tz } value={ tz }>
              { tz }
            </option>
          )) }
        </Select>
        { errors.preferredTimezone && (
          <Text as="div" sx={ { color: 'red', fontSize: 1, mt: 1 } }>
            Timezone is required
          </Text>
        ) }
      </Box>

      {/* First day of week */ }
      <Box mb={ 3 }>
        <Label htmlFor="firstDayOfWeek">First Day of the Week</Label>
        <Select
          id="firstDayOfWeek"
          { ...register('firstDayOfWeek', {
            required: 'First day of week is required',
          }) }
          aria-invalid={ errors.firstDayOfWeek ? 'true' : 'false' }
        >
          { DAYS_OF_WEEK.map((d) => (
            <option key={ d } value={ d }>
              { d }
            </option>
          )) }
        </Select>
        { errors.firstDayOfWeek && (
          <Text as="div" sx={ { color: 'red', fontSize: 1, mt: 1 } }>
            { errors.firstDayOfWeek.message }
          </Text>
        ) }
      </Box>

      <Button type="submit" disabled={ isSubmitting }>
        Save
      </Button>
    </Box>
  )
}

type PasswordUpdateFormValues = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function PasswordUpdateForm (): JSX.Element {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    watch,
  } = useForm<PasswordUpdateFormValues>({
    mode: 'onBlur',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const newPasswordValue = watch('newPassword', '')
  const currentPasswordValue = watch('currentPassword', '')

  const onSubmit = (values: PasswordUpdateFormValues) => {
    // In real usage, you would send this to your backend securely.
    console.log('password update submitted', {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
  }

  return (
    <Box as="form" onSubmit={ handleSubmit(onSubmit) } aria-label="Password update form">
      {/* Current password */ }
      <Box mb={ 3 }>
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          type="password"
          placeholder="••••••••"
          { ...register('currentPassword', {
            required: 'Current password is required',
          }) }
          aria-invalid={ errors.currentPassword ? 'true' : 'false' }
        />
        { errors.currentPassword && (
          <Text as="div" sx={ { color: 'red', fontSize: 1, mt: 1 } }>
            { errors.currentPassword.message }
          </Text>
        ) }
      </Box>

      {/* New password */ }
      <Box mb={ 3 }>
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          placeholder="At least 8 characters"
          { ...register('newPassword', {
            required: 'New password is required',
            minLength: {
              value: 8,
              message: 'New password must be at least 8 characters',
            },
            validate: (v) =>
              v !== currentPasswordValue || 'New password must be different from current password',
          }) }
          aria-invalid={ errors.newPassword ? 'true' : 'false' }
        />
        { errors.newPassword && (
          <Text as="div" sx={ { color: 'red', fontSize: 1, mt: 1 } }>
            { errors.newPassword.message }
          </Text>
        ) }
      </Box>

      {/* Confirm new password */ }
      <Box mb={ 3 }>
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Repeat new password"
          { ...register('confirmPassword', {
            required: 'Please confirm new password',
            validate: (v) => v === newPasswordValue || 'Passwords do not match',
          }) }
          aria-invalid={ errors.confirmPassword ? 'true' : 'false' }
        />
        { errors.confirmPassword && (
          <Text as="div" sx={ { color: 'red', fontSize: 1, mt: 1 } }>
            { errors.confirmPassword.message }
          </Text>
        ) }
      </Box>

      <Button type="submit" disabled={ isSubmitting }>
        Update Password
      </Button>
    </Box>
  )
}
