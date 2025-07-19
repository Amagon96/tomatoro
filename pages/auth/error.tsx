import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { Box, Card, Flex, Heading, Link as TuiLink, Paragraph } from 'theme-ui'

import { Page } from '~/components/templates/page'
import { LINKS } from '~/utils/config'

export default function CallbackPage () {
  const { t } = useTranslation('auth')

  const searchParams = useSearchParams()
  const reasonCode = searchParams.get('reason') || 'generic'

  return (
    <Page subtitle={ t('error.title') } noHeader noFooter>
      <Box sx={ { maxWidth: 400, mx: 'auto', px: 3, py: 4 } }>
        <Card>
          <Flex sx={ { flexDirection: 'column', gap: 3 } }>
            <Heading as="h1">{ t('error.title') }</Heading>
            <Paragraph>{ t(`error.${ reasonCode }`) }</Paragraph>
            <div>
              <TuiLink as={ Link } href={ LINKS.REGISTER }>{ t('verify.error.tryAgain') }</TuiLink>
            </div>
          </Flex>
        </Card>
      </Box>
    </Page>
  )
}
