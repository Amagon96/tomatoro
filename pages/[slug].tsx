import * as Sentry from '@sentry/nextjs'
import { GetStaticProps } from 'next'
import posthog from 'posthog-js'
import React from 'react'
import { Box, Grid, Heading } from 'theme-ui'
import { useIsClient } from 'usehooks-ts'

import { BackCta } from '~/components/atoms/back-cta'
import { PageRating } from '~/components/organisms/page-rating'
import { RichTextRenderer } from '~/components/organisms/rich-text-renderer'
import { SubscribeWidget } from '~/components/organisms/subscribe-widget'
import { Page } from '~/components/templates/page'
import { getBanners, getPostBySlug } from '~/utils/cms.api'
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
  { post: CmsPageEntry },
  { slug: string }
> = async ({ locale, params }) => {
  try {
    const slug = params?.slug || ''
    const [post, banners] = await Promise.all([
      getPostBySlug(slug, locale),
      getBanners(slug, locale),
    ])

    if (!post) {
      return { notFound: true }
    }

    return { props: { post, banners } }
  } catch (e) {
    Sentry.captureException(e)
    return { notFound: true }
  }
}

export default function PageBySlug ({ banners, post }: { post: CmsPageEntry, banners: Banner[] }) {
  const isClient = useIsClient()
  const isPageRatingWidgetEnabled = posthog.isFeatureEnabled('page-rating-widget')
  const isSubscriptionWidgetEnabled = posthog.isFeatureEnabled('subscription-widget')
  const userActivity = posthog.isFeatureEnabled('user-activity')
  console.log('[DEBUG] userActivity', userActivity)

  if (!post) {
    return null
  }

  const showHero = !!post.attributes.hero?.data?.attributes.url

  return (
    <Page
      banners={ banners }
      hero={ {
        imageUrl: post.attributes.hero?.data?.attributes.url,
        caption: post.attributes.hero?.data?.attributes.caption,
      } }
      seo={ post.attributes.seo }
      subtitle={ post.attributes.title }
      isWrapped
    >
      <Grid variant="contained"
        sx={ {
          gap: 3,
          lineHeight: 2,
          justifyItems: 'start',
          paddingTop: showHero && 5,
        } }>
        <Heading as="h1">{ post.attributes.title }</Heading>
        <RichTextRenderer content={ post.attributes.content }/>
        { isClient && isPageRatingWidgetEnabled && (
          <Box sx={ { my: 5 } }>
            <PageRating pageId={ post.attributes.slug }/>
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
