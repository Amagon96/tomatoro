import React, { FC } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Label, Input, Button, Text, Flex, Heading } from 'theme-ui'

import { LanguageSelector } from '~/components/molecules/language-selector'

type SettingsFormValues = {
  focusSessionLength: number
  shortBreakLength: number
  longBreakLength: number
  showTimerOnTitle: boolean
  showNotification: boolean
}

const DEFAULTS: SettingsFormValues = {
  focusSessionLength: 25,
  shortBreakLength: 5,
  longBreakLength: 15,
  showTimerOnTitle: true,
  showNotification: true,
}

export const SettingsForm: FC = () => {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<SettingsFormValues>({
    mode: 'onBlur',
    defaultValues: DEFAULTS,
  })

  const watchedFocus = watch('focusSessionLength')
  const watchedShort = watch('shortBreakLength')
  const watchedLong = watch('longBreakLength')
  const watchedShowTimer = watch('showTimerOnTitle')
  const watchedShowNotification = watch('showNotification')

  const onSubmit = (values: SettingsFormValues) => {
    console.log('settings submitted', values)
  }

  const handleReset = () => {
    reset(DEFAULTS)
  }

  return (
    <Box as="form" onSubmit={ handleSubmit(onSubmit) } aria-label="Settings form">
      <Box mb={ 4 }>
        <Label htmlFor="focusSessionLength">Focus Session Length (minutes)</Label>
        <Flex sx={ { alignItems: 'center', gap: 3 } }>
          <Input
            id="focusSessionLength"
            type="range"
            min={ 1 }
            max={ 60 }
            step={ 1 }
            aria-valuemin={ 1 }
            aria-valuemax={ 60 }
            aria-valuenow={ watchedFocus }
            { ...register('focusSessionLength', {
              valueAsNumber: true,
              required: 'Focus session length is required',
              min: { value: 1, message: 'Must be at least 1 minute' },
              max: { value: 60, message: 'Cannot exceed 60 minutes' },
            }) }
          />
          <Text as="div" sx={ { minWidth: 60 } }>
            { watchedFocus } min
          </Text>
        </Flex>
        { errors.focusSessionLength && (
          <Text as="div" sx={ { color: 'red', fontSize: 1, mt: 1 } }>
            { errors.focusSessionLength.message }
          </Text>
        ) }
      </Box>

      <Box mb={ 4 }>
        <Label htmlFor="shortBreakLength">Short Break Length (minutes)</Label>
        <Flex sx={ { alignItems: 'center', gap: 3 } }>
          <Input
            id="shortBreakLength"
            type="range"
            min={ 1 }
            max={ 15 }
            step={ 1 }
            aria-valuemin={ 1 }
            aria-valuemax={ 15 }
            aria-valuenow={ watchedShort }
            { ...register('shortBreakLength', {
              valueAsNumber: true,
              required: 'Short break length is required',
              min: { value: 1, message: 'Must be at least 1 minute' },
              max: { value: 15, message: 'Cannot exceed 15 minutes' },
            }) }
          />
          <Text as="div" sx={ { minWidth: 60 } }>
            { watchedShort } min
          </Text>
        </Flex>
        { errors.shortBreakLength && (
          <Text as="div" sx={ { color: 'red', fontSize: 1, mt: 1 } }>
            { errors.shortBreakLength.message }
          </Text>
        ) }
      </Box>

      <Box mb={ 4 }>
        <Label htmlFor="longBreakLength">Long Break Length (minutes)</Label>
        <Flex sx={ { alignItems: 'center', gap: 3 } }>
          <Input
            id="longBreakLength"
            type="range"
            min={ 1 }
            max={ 30 }
            step={ 1 }
            aria-valuemin={ 1 }
            aria-valuemax={ 30 }
            aria-valuenow={ watchedLong }
            { ...register('longBreakLength', {
              valueAsNumber: true,
              required: 'Long break length is required',
              min: { value: 1, message: 'Must be at least 1 minute' },
              max: { value: 30, message: 'Cannot exceed 30 minutes' },
            }) }
          />
          <Text as="div" sx={ { minWidth: 60 } }>
            { watchedLong } min
          </Text>
        </Flex>
        { errors.longBreakLength && (
          <Text as="div" sx={ { color: 'red', fontSize: 1, mt: 1 } }>
            { errors.longBreakLength.message }
          </Text>
        ) }
      </Box>

      <Box mb={ 4 }>
        <Label>Options</Label>
        <Box>
          <Flex sx={ { alignItems: 'center', gap: 2, mb: 2 } }>
            <Input
              id="showTimerOnTitle"
              type="checkbox"
              { ...register('showTimerOnTitle') }
              aria-checked={ watchedShowTimer }
              sx={ { width: 'auto' } }
            />
            <Label htmlFor="showTimerOnTitle" sx={ { mb: 0 } }>
              Show timer on title
            </Label>
          </Flex>
          <Flex sx={ { alignItems: 'center', gap: 2 } }>
            <Input
              id="showNotification"
              type="checkbox"
              { ...register('showNotification') }
              aria-checked={ watchedShowNotification }
              sx={ { width: 'auto' } }
            />
            <Label htmlFor="showNotification" sx={ { mb: 0 } }>
              Show notification when timer ends
            </Label>
          </Flex>
        </Box>
      </Box>

      <Box mb={ 4 }>
        <Label>Language</Label>
        <LanguageSelector/>
      </Box>

      <Flex sx={ { gap: 3, flexWrap: 'wrap' } }>
        <Button type="submit" disabled={ isSubmitting }>
          Save Settings
        </Button>
        <Button type="button" onClick={ handleReset } variant="secondary">
          Reset to Defaults
        </Button>
      </Flex>
    </Box>
  )
}
