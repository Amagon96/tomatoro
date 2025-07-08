import { usePostHog } from 'posthog-js/react'
import React, { FC } from 'react'
import { Box, Grid, Heading } from 'theme-ui'
import { useIsClient } from 'usehooks-ts'

import { BackCta } from '~/components/atoms/back-cta'
import { PageRating } from '~/components/organisms/page-rating'
import { RichTextRenderer } from '~/components/organisms/rich-text-renderer'
import { SubscribeWidget } from '~/components/organisms/subscribe-widget'
import { Page } from '~/components/templates/page'

interface CmsArticleProps {
  article: CmsPageEntry
}

export const CmsArticle: FC<CmsArticleProps> = ({ article }) => {
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
        <Heading as="h1">{ article.title }</Heading>
        {
          article.blocks?.map((block) => {
            if (block.__component === 'shared.rich-text') {
              return <RichTextRenderer key={ block.id } content={ block.body }/>
            }
            return null
          })
        }
        { isClient && isPageRatingWidgetEnabled && (
          <Box sx={ { my: 5 } }>
            <PageRating pageId={ article.slug }/>
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
