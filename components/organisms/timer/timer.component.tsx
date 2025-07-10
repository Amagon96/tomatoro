import useTranslation from 'next-translate/useTranslation'
import React, { FC } from 'react'
import { Flex, Text } from 'theme-ui'

import { useTimerContext } from '~/contexts/timer'
import { useTimerStore } from '~/stores/time'
import { formatTime } from '~/utils/timer.utils'

import { Button, Controls, Image } from './timer.styles'
import tomatoHero from './tomato-hero.svg'

export const Timer: FC = () => {
  const { t } = useTranslation('common')
  const { onResetTimer, onStartTimer, onStopTimer } = useTimerContext()
  const { isRunning, isStarted, time, totalTime } = useTimerStore()

  const onToggleClick = () => {
    if (!isStarted) {
      onStartTimer()
    } else if (isRunning) {
      onStopTimer()
    } else {
      onStartTimer()
    }
  }

  const onStopClick = () => {
    onResetTimer()
  }

  return (
    <Flex sx={ {
      alignItems: 'center',
      flexDirection: 'column',
      gap: '1em',
      height: 400,
      justifyContent: 'center',
      maxWidth: 768,
      position: 'relative',
      width: ['calc(100vw - 2rem)', 'auto'],
    } }>
      <Image
        priority
        src={ tomatoHero }
        alt=""
        aria-hidden
      />
      <Text variant="display">
        { formatTime(time) }
      </Text>
      <Controls>
        <Button
          variant="action"
          onClick={ onStopClick }
          disabled={ !isStarted }
          data-tracking-id="button-timer-done"
        >
          { t('done') }
        </Button>
        <Button
          variant="action"
          onClick={ onToggleClick }
          data-tracking-id={ isRunning ? 'button-timer-pause' : 'button-timer-start' }
        >
          { isRunning ? t('pause') : t('start') }
        </Button>
      </Controls>
    </Flex>
  )
}
