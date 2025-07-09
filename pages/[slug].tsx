import * as Sentry from '@sentry/nextjs'
import { GetStaticProps } from 'next'
import { usePostHog } from 'posthog-js/react'
import React from 'react'
import { Box, Grid } from 'theme-ui'
import { useIsClient } from 'usehooks-ts'

import { BackCta } from '~/components/atoms/back-cta'
import { PageRating } from '~/components/organisms/page-rating'
import { SubscribeWidget } from '~/components/organisms/subscribe-widget'
import { CmsArticle } from '~/components/templates/cms-article'
import { Page } from '~/components/templates/page'
import { getArticleBySlug } from '~/utils/cms.api'
import { PAGES } from '~/utils/config'

export const getStaticPaths = async () => {
  const pagesForDefaultLocale = PAGES['en']
  const paths = Object.keys(pagesForDefaultLocale).map((key) => ({
    params: { slug: pagesForDefaultLocale[key as keyof typeof pagesForDefaultLocale] },
  }))

  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<
  { article: BasicPage },
  { slug: string }
> = async ({ locale, params }) => {
  try {
    const slug = params?.slug || ''
    const [article] = await Promise.all([
      getArticleBySlug(slug, locale),
    ])

    if (!article) {
      return { notFound: true }
    }

    return { props: { article, slug } }
  } catch (e) {
    Sentry.captureException(e)
    return { notFound: true }
  }
}

export default function PageBySlug ({ article, slug }: { article: BasicPage, slug: string }) {
  const isClient = useIsClient()
  const posthog = usePostHog()
  const isSubscriptionWidgetEnabled = posthog.isFeatureEnabled('subscription-widget')
  const isPageRatingWidgetEnabled = posthog.isFeatureEnabled('page-rating-widget')

  if (!article) {
    return null
  }

  return (
    <Page isWrapped>
      <Grid variant="contained"
        sx={ {
          gap: 3,
          lineHeight: 2,
          justifyItems: 'start',
        } }>
        <CmsArticle article={ article }/>
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
