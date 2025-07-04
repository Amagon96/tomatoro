import * as Sentry from '@sentry/nextjs'
import { GetServerSideProps } from 'next'
import React from 'react'
import { Box, Grid, Heading } from 'theme-ui'
import { useIsClient } from 'usehooks-ts'

import { BackCta } from '~/components/atoms/back-cta'
import { PageRating } from '~/components/organisms/page-rating'
import { RichTextRenderer } from '~/components/organisms/rich-text-renderer'
import { SubscribeWidget } from '~/components/organisms/subscribe-widget'
import { Page } from '~/components/templates/page'
import { getPostBySlug } from '~/utils/cms.api'

export const getServerSideProps: GetServerSideProps<
  { post: CmsPageEntry },
  { slug: string }
> = async ({ locale, params }) => {
  try {
    const post = await getPostBySlug(params?.slug || '', locale)

    if (!post) {
      return { notFound: true }
    }

    return { props: { post } }
  } catch (e) {
    Sentry.captureException(e)
    return { notFound: true }
  }
}

export default function PostBySlug ({ post }: { post: CmsPageEntry }) {
  const isClient = useIsClient()

  if (!post) {
    return null
  }

  const showHero = !!post.attributes.hero?.data?.attributes.url

  return (
    <Page
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
        { isClient && (
          <Box sx={ { my: 5 } }>
            <PageRating pageId={ post.attributes.slug }/>
          </Box>
        ) }
        <BackCta/>
        { isClient && (
          <Box sx={ { my: 5 } }>
            <SubscribeWidget/>
          </Box>
        ) }
      </Grid>
    </Page>
  )
}
