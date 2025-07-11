import * as Sentry from '@sentry/nextjs'
import { GetServerSideProps } from 'next'
import { usePostHog } from 'posthog-js/react'
import React from 'react'
import { Box, Grid, Heading } from 'theme-ui'
import { useIsClient } from 'usehooks-ts'

import { BackCta } from '~/components/atoms/back-cta'
import { QuestionCard } from '~/components/atoms/question-card'
import { PageRating } from '~/components/organisms/page-rating'
import { SubscribeWidget } from '~/components/organisms/subscribe-widget'
import { RenderCmsArticleBlocks } from '~/components/templates/cms-article'
import { Page } from '~/components/templates/page'
import { getArticleBySlug, getQuestions } from '~/utils/cms.api'
import { createFaqStructuredData } from '~/utils/structured-data.utils'

const slug = 'faq'

export const getServerSideProps: GetServerSideProps<{}> = async ({ locale }) => {
  try {
    const [page, questions] = await Promise.all([
      getArticleBySlug(slug, locale),
      getQuestions(locale),
    ])
    return { props: { questions, page } }
  } catch (e) {
    Sentry.captureException(e)
    return { props: { questions: [], page: null } }
  }
}

interface RouteProps {
  questions: Question[]
  page: CmsArticleEntry | null
}

export default function Faq ({ page, questions }: RouteProps) {
  const isClient = useIsClient()
  const posthog = usePostHog()
  const isSubscriptionWidgetEnabled = posthog.isFeatureEnabled('subscription-widget')
  const isPageRatingWidgetEnabled = posthog.isFeatureEnabled('page-rating-widget')
  const sortedQuestions = questions.sort((a, b) => a.id - b.id)

  if (!page) {
    return null
  }

  return (
    <Page
      isWrapped
      seo={ {
        ...page.seo,
        structuredData: JSON.stringify(createFaqStructuredData(questions)),
      } }
    >
      <Grid
        variant="contained"
        sx={ {
          gap: 3,
          lineHeight: 2,
          justifyItems: 'start',
        } }>
        <Heading as="h1">{ page.title }</Heading>
        <RenderCmsArticleBlocks blocks={ page.blocks }/>

        { sortedQuestions.map((question) => (
          <QuestionCard key={ question.question }
            question={ question.question }
            answer={ question.blocks }/>
        )) }

        { isClient && isPageRatingWidgetEnabled && (
          <Box sx={ { my: 5 } }>
            <PageRating pageId={ slug }/>
          </Box>
        ) }

        <BackCta/>

        { isClient && isSubscriptionWidgetEnabled && (
          <Box sx={ { my: 5 } }>
            <SubscribeWidget/>
          </Box>
        ) }
      </Grid>
    </Page>
  )
}
