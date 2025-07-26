import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import React, { useMemo, useState } from 'react'
import { Box, Card, Flex, Progress } from 'theme-ui'

import { Page } from '~/components/templates/page'
import { FinalStepPage, LanguageStepPage, ProfileStepPage } from '~/components/templates/welcome'
import { LINKS } from '~/utils/config'

const STEPS = [
  LanguageStepPage,
  ProfileStepPage,
  FinalStepPage,
]

export default function CallbackPage () {
  const router = useRouter()
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
